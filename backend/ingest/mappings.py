"""
Field-mapping dictionaries — the heart of the dynamic mapping engine.

These dictionaries are the DEFAULTS. At runtime they can be overridden /
extended by admin-edited mappings persisted in storage (value_mappings).
The pipeline calls into here through normalize.py.

All comparison is done on a "folded" key (see fold()) so that:
  - Cyrillic/Latin lookalikes collapse ("Dоne" with a Cyrillic 'о' == "done")
  - case / surrounding whitespace / quotes are ignored
"""
from __future__ import annotations
import unicodedata

# Full Russian Cyrillic -> ASCII transliteration so mapping keys can be
# written in readable Latin form and still match Russian source data.
# Also collapses Cyrillic/Latin lookalike confusion (e.g. status "Dоne"
# where the 'o' is actually Cyrillic U+043E).
_CYR_TO_LAT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def fold(value) -> str:
    """Normalize a raw cell to a comparison key."""
    if value is None:
        return ""
    s = str(value).strip().lower()
    s = s.replace("«", "").replace("»", "").replace('"', "").replace("'", "")
    s = " ".join(s.split())
    s = "".join(_CYR_TO_LAT.get(ch, ch) for ch in s)
    return s


# ---------------------------------------------------------------------------
# STATUS  ->  (canonical_status, status_group)
#   group ∈ {open, closed, rejected}
# ---------------------------------------------------------------------------
STATUS_MAP = {
    "done": ("Done", "closed"),
    "gotovo": ("Done", "closed"),               # Готово
    "vypolneno": ("Done", "closed"),            # Выполнено
    "closed": ("Done", "closed"),
    "resolved": ("Done", "closed"),
    "otkloneno": ("Rejected", "rejected"),      # Отклонено
    "rejected": ("Rejected", "rejected"),
    "otmeneno": ("Rejected", "rejected"),       # Отменено
    "na utochnenii": ("Clarifying", "open"),    # На уточнении
    "k ispolneniyu": ("To Do", "open"),         # К исполнению
    "to do": ("To Do", "open"),
    "open": ("To Do", "open"),
    "v rabote": ("In Progress", "open"),        # В работе
    "work in progress": ("In Progress", "open"),
    "in progress": ("In Progress", "open"),
}


def map_status(raw):
    key = fold(raw)
    if not key:
        return ("Unknown", "open")
    if key in STATUS_MAP:
        return STATUS_MAP[key]
    # token fallback
    if "done" in key or "gotov" in key or "vypoln" in key:
        return ("Done", "closed")
    if "otklon" in key or "reject" in key or "otmen" in key:
        return ("Rejected", "rejected")
    if "rabote" in key or "progress" in key:
        return ("In Progress", "open")
    return ("Unknown", "open")


# ---------------------------------------------------------------------------
# PRIORITY
# ---------------------------------------------------------------------------
PRIORITY_MAP = {
    "blocker": "Blocker", "bloker": "Blocker", "blokir": "Blocker",  # Блокер
    "highest": "Highest", "high": "High", "vysokiy": "High",
    "medium": "Medium", "sredniy": "Medium",
    "low": "Low", "nizkiy": "Low", "lowest": "Lowest",
}


def map_priority(raw):
    key = fold(raw)
    return PRIORITY_MAP.get(key, str(raw).strip() if raw else "Medium")


# ---------------------------------------------------------------------------
# REQUEST TYPE  ->  (canonical_code, english_label)
# Codes drive the auto-generated per-type dashboard routes.
# ---------------------------------------------------------------------------
REQUEST_TYPE_MAP = {
    "sozdanie novogo servera": ("new_server", "Create New Server"),
    "izmenenie konfiguracii servera": ("expand_server", "Expand / Reconfigure Server"),
    "sozdanie vnutrenney dns zapisi": ("dns_internal", "Internal DNS Record"),
    "sozdanie vneshney dns zapisi": ("dns_external", "External DNS Record"),
    "sozdanie tehnicheskoy uch. zapisi": ("tech_account", "Technical Account"),
    "sozdanie tehnicheskoy uch zapisi": ("tech_account", "Technical Account"),
    "ustanovka prilozheniya": ("app_install", "Application Install"),
    "udalenie servera": ("server_delete", "Delete Server"),
    "bekap servera": ("backup", "Server Backup"),
}


def map_request_type(raw):
    key = fold(raw)
    if not key:
        return ("other", "Other / Unspecified", str(raw or "").strip())
    if key in REQUEST_TYPE_MAP:
        code, label = REQUEST_TYPE_MAP[key]
        return (code, label, str(raw).strip())
    # heuristic fallbacks
    if "novogo servera" in key:
        return ("new_server", "Create New Server", str(raw).strip())
    if "konfiguracii" in key or "izmenenie" in key:
        return ("expand_server", "Expand / Reconfigure Server", str(raw).strip())
    if "dns" in key and ("vnutr" in key):
        return ("dns_internal", "Internal DNS Record", str(raw).strip())
    if "dns" in key:
        return ("dns_external", "External DNS Record", str(raw).strip())
    if "uch" in key:
        return ("tech_account", "Technical Account", str(raw).strip())
    if "prilozhen" in key or "ustanovka" in key:
        return ("app_install", "Application Install", str(raw).strip())
    if "udalenie" in key:
        return ("server_delete", "Delete Server", str(raw).strip())
    if "bekap" in key or "backup" in key:
        return ("backup", "Server Backup", str(raw).strip())
    return ("other", str(raw).strip() or "Other", str(raw or "").strip())


# ---------------------------------------------------------------------------
# DEPARTMENT canonicalization
#   - collapse the worst duplicate clusters in the real data
#   - blank -> Unassigned
# ---------------------------------------------------------------------------
DEPARTMENT_SYNONYMS = {
    # folded-substring -> canonical display name
    "finansovoe upravlenie": "Финансовое управление",
    "finupravlenie": "Финансовое управление",
    "finuprav": "Финансовое управление",
    "processingoviy centr": "Процессинговый центр",
    "processing": "Процессинговый центр",
    "department cifrovyh tehnologiy": "Департамент цифровых технологий",
    "dct": "Департамент цифровых технологий",
    "devops": "DevOps",
    "it departament": "ИТ департамент",
    "it infrastructure": "IT Infrastructure",
    "it (infrastructure) / internal": "IT Infrastructure",
}

DEPT_UNASSIGNED = "Не указано (Unassigned)"


def map_department(raw):
    if raw is None or str(raw).strip() == "":
        return DEPT_UNASSIGNED
    key = fold(raw)
    for sub, canon in DEPARTMENT_SYNONYMS.items():
        if sub in key:
            return canon
    # title-case the cleaned original, preserving Cyrillic
    cleaned = " ".join(str(raw).strip().replace("«", "").replace("»", "").split())
    return cleaned


# ---------------------------------------------------------------------------
# SERVER TYPE (multi-value)  e.g. "Data Base, Application" -> ["Database","Application"]
# ---------------------------------------------------------------------------
SERVER_TYPE_CANON = {
    "data base": "Database", "database": "Database", "db": "Database",
    "application": "Application", "app": "Application",
    "web application": "Web", "web": "Web",
    "middleware": "Middleware", "integration": "Integration",
    "api": "API", "proxy": "Proxy", "reverse proxy": "Proxy",
    "balancer": "Balancer", "container": "Container Platform",
}


def map_server_types(raw):
    if not raw or not str(raw).strip():
        return []
    parts = [p.strip() for p in str(raw).replace(";", ",").split(",") if p.strip()]
    out = []
    for p in parts:
        out.append(SERVER_TYPE_CANON.get(fold(p), p.strip()))
    # dedupe preserving order
    seen, res = set(), []
    for x in out:
        if x not in seen:
            seen.add(x)
            res.append(x)
    return res


# ---------------------------------------------------------------------------
# ENVIRONMENT inference from summary + description
#   order matters: more specific first
# ---------------------------------------------------------------------------
_ENV_RULES = [
    ("PREPROD", ["preprod", "pre-prod", "pre prod", "predprod", "предпрод", "пре-прод"]),
    ("UAT", ["uat", "юат"]),
    ("DR", [" dr ", "disaster", "катастроф", "резервный цод", "drp"]),
    ("PROD", ["prod", "продакш", "пром", "production", "боевой", "боевая", "промышлен"]),
    ("TEST", ["test", "тест", "qa", "стенд"]),
    ("DEV", ["dev", "разраб", "девелоп"]),
]


def infer_environment(summary, description):
    text = f" {fold(summary)} {fold(description)} "
    for env, keys in _ENV_RULES:
        for k in keys:
            if k.strip() and k in text:
                return env
    return "Unspecified"
