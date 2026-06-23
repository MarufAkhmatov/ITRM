"""
AMIR — IT Resource Copilot (multilingual).

Pipeline:
  query -> detect_lang() -> classify_intent() -> compute REAL metric
        -> render template in the detected language -> answer

Languages: RU (Cyrillic), UZ (Uzbek-Latin markers), EN (default).
Numbers always come from the active dataset; the LLM layer is optional and
sits on top of this deterministic core.
"""
from __future__ import annotations
import re
from collections import Counter, defaultdict
from datetime import datetime

from ..analytics.kpis import executive, departments_analytics
from ..analytics.forecast import forecast_resources


# ---------------------------------------------------------------------------
# Language detection — cheap heuristic, no dependencies.
# ---------------------------------------------------------------------------
_UZ_MARKERS = {
    # latin words that are clearly Uzbek, not English
    "qaysi", "boʻlim", "bolim", "boyicha", "ko'p", "kop", "talab",
    "soʻrov", "sorov", "resurs", "eng", "yil", "oy", "chorak",
    "berilgan", "ajratilgan", "prognoz", "kelasi", "keyingi",
    "umumiy", "jami", "yuklash", "muhit", "salom",
}


# Cyrillic block U+0400..U+04FF + Cyrillic Supplement U+0500..U+052F.
# Build with chr() so the pattern is encoding-independent.
_CYRILLIC_RE = re.compile("[" + chr(0x400) + "-" + chr(0x52F) + "]")


def detect_lang(text: str) -> str:
    if not text:
        return "en"
    # Any Cyrillic letter → Russian (use explicit Unicode range so it survives
    # any file-encoding round-trips).
    if _CYRILLIC_RE.search(text):
        return "ru"
    t = text.lower()
    # Uzbek-Latin markers (incl. ʻ / ʼ apostrophes used in modern Uzbek)
    if "ʻ" in text or "ʼ" in text or "ʻ" in text or "ʼ" in text:
        return "uz"
    for w in _UZ_MARKERS:
        if re.search(r"\b" + re.escape(w) + r"\b", t):
            return "uz"
    return "en"


# ---------------------------------------------------------------------------
# Localized phrase library — each intent has 3 language renderings.
# ---------------------------------------------------------------------------
def _fmt(n, digits=2):
    if n is None:
        return "—"
    try:
        return f"{float(n):,.{digits}f}".rstrip("0").rstrip(".")
    except Exception:
        return str(n)


PHRASES = {
    "unit_ram":     {"en": "GB RAM",            "ru": "ГБ RAM",            "uz": "GB RAM"},
    "unit_cpu":     {"en": "vCPU",              "ru": "vCPU",              "uz": "vCPU"},
    "unit_storage": {"en": "GB Storage",        "ru": "ГБ хранилища",     "uz": "GB xotira"},
    "top_dept_resource": {
        "en": "Top department by {unit}{year}: {name} ({value} {unit}).",
        "ru": "Лидер по {unit}{year}: {name} ({value} {unit}).",
        "uz": "{unit} boʻyicha eng katta sarflagan boʻlim{year}: {name} ({value} {unit}).",
    },
    "top_dept_resource_in": {
        "en": " in {year}",
        "ru": " за {year} год",
        "uz": " ({year} yilda)",
    },
    "no_data": {
        "en": "No data.",
        "ru": "Данных нет.",
        "uz": "Maʼlumot yoʻq.",
    },
    "forecast": {
        "en": "Expected monthly demand (avg of last 6 months): {avg} {unit}. "
              "Next quarter: {q}, next year: {y}.",
        "ru": "Ожидаемый месячный спрос (среднее за 6 мес.): {avg} {unit}. "
              "Следующий квартал: {q}, следующий год: {y}.",
        "uz": "Kutilayotgan oylik talab (oxirgi 6 oy oʻrtachasi): {avg} {unit}. "
              "Keyingi chorak: {q}, keyingi yil: {y}.",
    },
    "exec_summary": {
        "en": ("Total requests: {total}, open: {open}, closed: {closed}, "
               "fulfillment rate: {rate}%. Allocated: {cpu} vCPU, "
               "{ram} GB RAM, {storage} GB Storage."),
        "ru": ("Всего запросов: {total}, открыто: {open}, закрыто: {closed}, "
               "уровень выполнения: {rate}%. Выделено: {cpu} vCPU, "
               "{ram} ГБ RAM, {storage} ГБ хранилища."),
        "uz": ("Jami soʻrovlar: {total}, ochiq: {open}, yopilgan: {closed}, "
               "bajarish darajasi: {rate}%. Ajratilgan: {cpu} vCPU, "
               "{ram} GB RAM, {storage} GB xotira."),
    },
    "top_departments": {
        "en": "Top departments by request count: ",
        "ru": "Топ подразделений по количеству запросов: ",
        "uz": "Soʻrovlar soni boʻyicha eng faol boʻlimlar: ",
    },
    "forecast_horizon_rest_2026": {
        "en": ("Forecast for the rest of 2026 (Jul-Dec): "
               "CPU ~{cpu} vCPU, RAM ~{ram} GB, Storage ~{sto} GB (expected)."),
        "ru": ("Прогноз до конца 2026 (июль-декабрь): "
               "CPU ~{cpu} vCPU, RAM ~{ram} ГБ, Хранилище ~{sto} ГБ (ожидаемо)."),
        "uz": ("2026 yil yakuniga qadar prognoz (iyul-dekabr): "
               "CPU ~{cpu} vCPU, RAM ~{ram} GB, Xotira ~{sto} GB (kutilayotgan)."),
    },
    "forecast_horizon_y2027": {
        "en": ("Forecast for 2027 (full year): "
               "CPU ~{cpu} vCPU, RAM ~{ram} GB, Storage ~{sto} GB (expected)."),
        "ru": ("Прогноз на 2027 год: "
               "CPU ~{cpu} vCPU, RAM ~{ram} ГБ, Хранилище ~{sto} ГБ (ожидаемо)."),
        "uz": ("2027 yil uchun prognoz: "
               "CPU ~{cpu} vCPU, RAM ~{ram} GB, Xotira ~{sto} GB (kutilayotgan)."),
    },
    "default": {
        "en": ("I'm AMIR. I see {total} requests in the active dataset "
               "({open} open, {closed} closed). Try: 'top departments by RAM', "
               "'forecast CPU next year', or 'executive summary'."),
        "ru": ("Я — AMIR. В активном наборе данных {total} запросов "
               "({open} открыто, {closed} закрыто). Попробуйте: "
               "«топ подразделений по RAM», «прогноз CPU на следующий год», "
               "«сводка по компании»."),
        "uz": ("Men AMIR. Faol maʼlumotlar toʻplamida {total} ta soʻrov bor "
               "({open} ochiq, {closed} yopilgan). Sinab koʻring: "
               "“RAM boʻyicha top boʻlimlar”, “kelasi yilga CPU prognozi”, "
               "“rahbariyat uchun sarhisob”."),
    },
}


def _p(key, lang, **kw):
    s = PHRASES[key].get(lang) or PHRASES[key]["en"]
    return s.format(**kw) if kw else s


# ---------------------------------------------------------------------------
# Resource detection in 3 languages.
# ---------------------------------------------------------------------------
_RESOURCE_KEYS = {
    "ram": "ram_gb", "память": "ram_gb", "memory": "ram_gb", "xotira": "ram_gb",
    "cpu": "cpu_vcpu", "процесс": "cpu_vcpu", "vcpu": "cpu_vcpu", "protsess": "cpu_vcpu",
    "storage": "storage_gb", "диск": "storage_gb", "хранил": "storage_gb",
    "disk": "storage_gb", "xotira": "storage_gb", "xranil": "storage_gb",
}


def _detect_resource(q):
    ql = q.lower()
    if "ram" in ql or "память" in ql or "memory" in ql:
        return "ram_gb"
    if "cpu" in ql or "процесс" in ql or "vcpu" in ql or "protsess" in ql:
        return "cpu_vcpu"
    if "storage" in ql or "диск" in ql or "хранил" in ql or "disk" in ql or "xranil" in ql:
        return "storage_gb"
    return None


def _resource_unit_key(res):
    return {"ram_gb": "unit_ram", "cpu_vcpu": "unit_cpu", "storage_gb": "unit_storage"}[res]


def _detect_year(q):
    m = re.search(r"\b(20\d{2})\b", q)
    return int(m.group(1)) if m else None


def _dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", ""))
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Intent triggers in three languages.
# ---------------------------------------------------------------------------
_FORECAST_TRIGGERS = (
    "predict", "forecast", "next ",
    "прогноз", "следующ", "будущ",
    "prognoz", "kelas", "keyingi",
)
_TOP_TRIGGERS = (
    "which dep", "top", "most", "highest", "leader",
    "какой департам", "какое подразд", "больш", "лидер", "топ",
    "qaysi", "eng kop", "eng koʻp", "eng katta", "yetakchi",
)
_SUMMARY_TRIGGERS = (
    "summary", "overview",
    "сводк", "обзор",
    "sarhisob", "umumiy", "jami koʻrinish",
)
_DEPT_TRIGGERS = (
    "department",
    "подразд", "отдел",
    "boʻlim", "bolim",
)


def _any(text, triggers):
    return any(tr in text for tr in triggers)


# Phrase markers for "to the end of the current year". The actual gate is
# "this phrase is present AND '2026' or no year is present".
_END_MARKERS = (
    "rest of", "end of", "until end", "yakuniga", "yakuniga qadar",
    "до конца", "к концу",
)
# Phrase markers for 2027 / next year.
_NEXT_YEAR_MARKERS = (
    "next year", "следующий год", "следующего года",
    "keyingi yil", "kelas yil",
)


def _detect_horizon(ql: str):
    # 2027 takes precedence — it's explicit.
    if "2027" in ql or any(t in ql for t in _NEXT_YEAR_MARKERS):
        return "y2027"
    if any(t in ql for t in _END_MARKERS) and ("2026" in ql or "year" not in ql):
        return "rest_2026"
    return None


def answer(records, query: str):
    q = (query or "").strip()
    ql = q.lower()
    lang = detect_lang(q)
    res = _detect_resource(q)
    year = _detect_year(q)

    filters = {}
    if year:
        filters["year"] = year

    # Intent: forecast horizon (demo MVP — opens ForecastModal in the UI)
    horizon = _detect_horizon(ql)
    if horizon and ("forecast" in ql or "прогноз" in ql or "prognoz" in ql
                    or "resource" in ql or "ресурс" in ql or "resurs" in ql):
        payload = forecast_resources(records, horizon, lang=lang)
        r = payload["resources"]
        phrase_key = f"forecast_horizon_{horizon}"
        ans = _p(phrase_key, lang,
                 cpu=_fmt(r["cpu"]["total"]["expected"], 0),
                 ram=_fmt(r["ram"]["total"]["expected"], 0),
                 sto=_fmt(r["storage"]["total"]["expected"], 0))
        return {
            "intent": "forecast_horizon",
            "horizon": horizon,
            "answer": ans,
            "data": payload,
            "ui": {"open": "forecast_modal"},
        }

    # Intent: top department by a resource
    if res and _any(ql, _TOP_TRIGGERS):
        from ..analytics.filters import apply_filters
        rs = apply_filters(records, filters)
        agg = defaultdict(float)
        for r in rs:
            agg[r.get("department") or "—"] += r.get(res) or 0
        top = sorted(agg.items(), key=lambda x: -x[1])[:5]
        unit = _p(_resource_unit_key(res), lang)
        year_str = _p("top_dept_resource_in", lang, year=year) if year else ""
        if not top:
            return {"intent": "top_department_by_resource",
                    "answer": _p("no_data", lang), "data": []}
        return {
            "intent": "top_department_by_resource",
            "answer": _p("top_dept_resource", lang,
                         unit=unit, year=year_str,
                         name=top[0][0], value=_fmt(top[0][1])),
            "data": [{"name": k, "value": round(v, 2)} for k, v in top],
            "filters": filters,
        }

    # Intent: forecast a resource
    if res and _any(ql, _FORECAST_TRIGGERS):
        from ..analytics.filters import apply_filters
        rs = apply_filters(records, {})
        monthly = defaultdict(float)
        for r in rs:
            d = _dt(r.get("created_at"))
            if not d:
                continue
            monthly[f"{d.year}-{d.month:02d}"] += r.get(res) or 0
        series = [v for _, v in sorted(monthly.items())][-6:]
        avg = round(sum(series) / len(series), 2) if series else 0
        unit = _p(_resource_unit_key(res), lang)
        return {
            "intent": "forecast_resource",
            "answer": _p("forecast", lang,
                         avg=_fmt(avg), unit=unit,
                         q=_fmt(avg * 3), y=_fmt(avg * 12)),
            "data": [{"month": m, "value": round(v, 2)}
                     for m, v in sorted(monthly.items())],
        }

    # Intent: executive summary
    if _any(ql, _SUMMARY_TRIGGERS):
        kpi = executive(records, filters)["summary"]
        return {
            "intent": "executive_summary",
            "answer": _p("exec_summary", lang,
                         total=kpi["total_requests"],
                         open=kpi["open_requests"],
                         closed=kpi["closed_requests"],
                         rate=kpi["fulfillment_rate"],
                         cpu=_fmt(kpi["allocated_cpu_vcpu"]),
                         ram=_fmt(kpi["allocated_ram_gb"]),
                         storage=_fmt(kpi["allocated_storage_gb"])),
            "data": kpi,
        }

    # Intent: list top departments
    if _any(ql, _DEPT_TRIGGERS):
        d = departments_analytics(records, filters)
        top = d["rows"][:5]
        if not top:
            return {"intent": "top_departments",
                    "answer": _p("no_data", lang), "data": []}
        return {
            "intent": "top_departments",
            "answer": _p("top_departments", lang)
                      + ", ".join(f"{r['department']} ({r['requests']})" for r in top),
            "data": top,
        }

    # Default
    kpi = executive(records, filters)["summary"]
    return {
        "intent": "default",
        "answer": _p("default", lang,
                     total=kpi["total_requests"],
                     open=kpi["open_requests"],
                     closed=kpi["closed_requests"]),
        "data": kpi,
        "lang": lang,
    }
