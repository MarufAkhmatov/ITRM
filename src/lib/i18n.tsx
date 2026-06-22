import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Lang = 'en' | 'ru' | 'uz'

type Dict = Record<string, { en: string; ru: string; uz: string }>

const D: Dict = {
  // sidebar
  'sidebar.overview':       { en: 'Overview',       ru: 'Обзор',           uz: 'Umumiy' },
  'sidebar.request_types':  { en: 'Request Types',  ru: 'Типы запросов',   uz: 'Soʻrov turlari' },
  'sidebar.admin':          { en: 'Admin',          ru: 'Администрирование', uz: 'Boshqaruv' },
  'nav.executive':          { en: 'Executive Dashboard',  ru: 'Главная панель',  uz: 'Bosh boshqaruv paneli' },
  'nav.departments':        { en: 'Department Analytics', ru: 'Аналитика по подразделениям', uz: 'Boʻlimlar tahlili' },
  'nav.capacity':           { en: 'Capacity (Phase 2)',   ru: 'Ёмкость (этап 2)', uz: 'Sigʻim (2-bosqich)' },
  'nav.upload':             { en: 'Upload & ETL',         ru: 'Загрузка и ETL',  uz: 'Yuklash va ETL' },
  'nav.settings':           { en: 'Settings',             ru: 'Настройки',       uz: 'Sozlamalar' },
  'nav.amin':               { en: 'AMIN Copilot',         ru: 'Помощник AMIN',   uz: 'AMIN yordamchi' },

  // topbar
  'topbar.title':           { en: 'IT Resource Management — Executive Analytics',
                              ru: 'Управление ИТ-ресурсами — аналитика для руководства',
                              uz: 'IT resurslarini boshqarish — rahbariyat uchun tahlil' },
  'topbar.refresh':         { en: 'Refresh filters', ru: 'Обновить фильтры', uz: 'Filtrlarni yangilash' },
  'topbar.export_xlsx':     { en: 'Export XLSX',     ru: 'Экспорт XLSX',     uz: 'XLSX ga yuklab olish' },
  'topbar.export_csv':      { en: 'CSV',             ru: 'CSV',              uz: 'CSV' },
  'topbar.toggle_theme':    { en: 'Toggle theme',    ru: 'Переключить тему', uz: 'Mavzuni almashtirish' },
  'topbar.language':        { en: 'Language',        ru: 'Язык',             uz: 'Til' },

  // filters
  'filter.year':            { en: 'Year',         ru: 'Год',           uz: 'Yil' },
  'filter.quarter':         { en: 'Quarter',      ru: 'Квартал',       uz: 'Chorak' },
  'filter.month':           { en: 'Month',        ru: 'Месяц',         uz: 'Oy' },
  'filter.department':      { en: 'Department',   ru: 'Подразделение', uz: 'Boʻlim' },
  'filter.environment':     { en: 'Environment',  ru: 'Среда',         uz: 'Muhit' },
  'filter.request_type':    { en: 'Request Type', ru: 'Тип запроса',   uz: 'Soʻrov turi' },
  'filter.status':          { en: 'Status',       ru: 'Статус',        uz: 'Holat' },
  'filter.priority':        { en: 'Priority',     ru: 'Приоритет',     uz: 'Muhimlik' },
  'filter.all':             { en: 'All',          ru: 'Все',           uz: 'Hammasi' },
  'filter.clear':           { en: 'Clear',        ru: 'Сбросить',      uz: 'Tozalash' },

  // executive
  'exec.title':             { en: 'Executive Dashboard', ru: 'Главная панель', uz: 'Bosh boshqaruv paneli' },
  'exec.subtitle':          { en: 'Real-time view of IT infrastructure demand from Jira Service Management.',
                              ru: 'Состояние спроса на ИТ-инфраструктуру по данным Jira Service Management в реальном времени.',
                              uz: 'Jira Service Management asosida IT-infratuzilma talabining real vaqtdagi koʻrinishi.' },
  'kpi.total':              { en: 'Total Requests', ru: 'Всего запросов', uz: 'Jami soʻrovlar' },
  'kpi.open':               { en: 'Open',           ru: 'Открытые',       uz: 'Ochiq' },
  'kpi.open_sub':           { en: 'In Progress / To Do / Clarifying',
                              ru: 'В работе / Ожидают / Уточняются',
                              uz: 'Jarayonda / Navbatda / Aniqlanmoqda' },
  'kpi.closed':             { en: 'Closed',         ru: 'Закрытые',       uz: 'Yopilgan' },
  'kpi.fulfillment':        { en: 'fulfillment',    ru: 'выполнение',     uz: 'bajarish' },
  'kpi.rejected':           { en: 'Rejected',       ru: 'Отклонённые',    uz: 'Rad etilgan' },
  'kpi.rejection':          { en: 'rejection',      ru: 'отклонение',     uz: 'rad etish' },
  'kpi.avg_resolution':     { en: 'Avg Resolution', ru: 'Среднее время решения', uz: 'Oʻrtacha hal qilish vaqti' },
  'kpi.cycle':              { en: 'Cycle',          ru: 'Цикл',           uz: 'Sikl' },
  'kpi.alloc_cpu':          { en: 'Allocated CPU',      ru: 'Выделенный CPU',     uz: 'Ajratilgan CPU' },
  'kpi.alloc_ram':          { en: 'Allocated RAM',      ru: 'Выделенная RAM',     uz: 'Ajratilgan RAM' },
  'kpi.alloc_storage':      { en: 'Allocated Storage',  ru: 'Выделенное хранилище', uz: 'Ajratilgan xotira' },
  'kpi.requested':          { en: 'Requested',          ru: 'Запрошено',          uz: 'Talab qilingan' },
  'sec.trend':              { en: 'Resource Consumption Trend', ru: 'Динамика потребления ресурсов', uz: 'Resurslar sarfining dinamikasi' },
  'sec.monthly':            { en: 'Monthly',            ru: 'Помесячно',          uz: 'Oylik' },
  'sec.top_dept_req':       { en: 'Top Departments (Requests)',  ru: 'Топ подразделений (по запросам)', uz: 'Eng faol boʻlimlar (soʻrovlar)' },
  'sec.by_env':             { en: 'By Environment',     ru: 'По средам',          uz: 'Muhitlar boʻyicha' },
  'sec.by_status':          { en: 'By Status',          ru: 'По статусам',        uz: 'Holatlar boʻyicha' },
  'sec.top_dept_ram':       { en: 'Top Departments by RAM (GB)', ru: 'Топ подразделений по RAM (ГБ)',  uz: 'RAM (GB) boʻyicha eng koʻp sarflagan boʻlimlar' },
  'sec.by_type':            { en: 'Requests by Type',   ru: 'Запросы по типам',   uz: 'Tur boʻyicha soʻrovlar' },

  // departments
  'dept.title':             { en: 'Department Analytics', ru: 'Аналитика по подразделениям', uz: 'Boʻlimlar tahlili' },
  'dept.subtitle':          { en: 'Consumption, growth and ranking across {n} departments.',
                              ru: 'Потребление, рост и рейтинг по {n} подразделениям.',
                              uz: '{n} ta boʻlim boʻyicha sarflash, oʻsish va reyting.' },
  'dept.top_req':           { en: 'Top by Requests',  ru: 'Топ по запросам',     uz: 'Soʻrovlar boʻyicha top' },
  'dept.top_ram':           { en: 'Top by RAM (GB)',  ru: 'Топ по RAM (ГБ)',     uz: 'RAM (GB) boʻyicha top' },
  'dept.heatmap':           { en: 'Department × Month Heatmap (top 15)', ru: 'Тепловая карта: подразделения × месяц (топ-15)', uz: 'Issiqlik xaritasi: boʻlim × oy (top 15)' },
  'dept.all':               { en: 'All Departments',  ru: 'Все подразделения',  uz: 'Barcha boʻlimlar' },

  // upload
  'up.title':               { en: 'Upload & ETL',     ru: 'Загрузка и ETL',     uz: 'Yuklash va ETL' },
  'up.subtitle':            { en: 'Daily Jira Service Management export. Supports .xls, .xlsx, .csv, html-disguised .xls.',
                              ru: 'Ежедневная выгрузка из Jira Service Management. Поддерживаются .xls, .xlsx, .csv, .xls в формате HTML.',
                              uz: 'Jira Service Management dan kunlik eksport. .xls, .xlsx, .csv va HTML koʻrinishidagi .xls qoʻllab-quvvatlanadi.' },
  'up.drop':                { en: 'Drop the daily Jira export here, or click to choose',
                              ru: 'Перетащите сюда ежедневный экспорт Jira или нажмите для выбора',
                              uz: 'Kunlik Jira eksportni shu yerga tashlang yoki tanlash uchun bosing' },
  'up.busy':                { en: 'Ingesting…',       ru: 'Обработка…',         uz: 'Yuklanmoqda…' },
  'up.report':              { en: 'Ingestion Report', ru: 'Отчёт загрузки',     uz: 'Yuklash hisoboti' },
  'up.history':             { en: 'Upload History',   ru: 'История загрузок',   uz: 'Yuklash tarixi' },
  'up.activate':            { en: 'Activate',         ru: 'Активировать',       uz: 'Faollashtirish' },
  'up.active':              { en: 'Active',           ru: 'Активная',           uz: 'Faol' },

  // request type
  'rt.subtitle':            { en: 'Per-request-type dashboard · code:',
                              ru: 'Панель по типу запроса · код:',
                              uz: 'Soʻrov turi boʻyicha boshqaruv paneli · kod:' },

  // amin
  'amin.title':             { en: 'AMIN — IT Resource Copilot',
                              ru: 'AMIN — ИТ-помощник',
                              uz: 'AMIN — IT yordamchisi' },
  'amin.subtitle':          { en: 'Ask about departments, resources, trends, forecasts. Answers are grounded on the active dataset.',
                              ru: 'Спрашивайте о подразделениях, ресурсах, трендах и прогнозах. Ответы построены на активном наборе данных.',
                              uz: 'Boʻlimlar, resurslar, trendlar va prognozlar haqida soʻrang. Javoblar faol maʼlumotlar asosida tuziladi.' },
  'amin.placeholder':       { en: 'Ask AMIN…',        ru: 'Спросите AMIN…',     uz: 'AMIN dan soʻrang…' },
  'amin.send':              { en: 'Send',             ru: 'Отправить',          uz: 'Yuborish' },
  'amin.thinking':          { en: 'AMIN is thinking…',ru: 'AMIN думает…',       uz: 'AMIN oʻylanmoqda…' },

  // settings
  'set.title':              { en: 'Settings',         ru: 'Настройки',          uz: 'Sozlamalar' },
  'set.finops':             { en: 'FinOps unit rates (monthly, USD)',
                              ru: 'Стоимостные ставки FinOps (в месяц, USD)',
                              uz: 'FinOps tarif stavkalari (oylik, USD)' },
  'set.save':               { en: 'Save rates',       ru: 'Сохранить',          uz: 'Saqlash' },

  // misc
  'common.loading':         { en: 'Loading…',         ru: 'Загрузка…',          uz: 'Yuklanmoqda…' },
  'common.no_data':         { en: 'No data yet',      ru: 'Данных пока нет',    uz: 'Hozircha maʼlumot yoʻq' },
  'common.go_upload':       { en: 'Go to Upload',     ru: 'Перейти к загрузке', uz: 'Yuklash sahifasiga oʻtish' },
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, any>) => string }
const I18n = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('itrm.lang') as Lang) || 'en')
  useEffect(() => { localStorage.setItem('itrm.lang', lang); document.documentElement.lang = lang }, [lang])
  const t = (key: string, vars?: Record<string, any>) => {
    const entry = D[key]
    let v = entry ? entry[lang] || entry.en : key
    if (vars) for (const k of Object.keys(vars)) v = v.replace(`{${k}}`, String(vars[k]))
    return v
  }
  return <I18n.Provider value={{ lang, setLang: setLangState, t }}>{children}</I18n.Provider>
}

export function useI18n() {
  const c = useContext(I18n)
  if (!c) throw new Error('useI18n must be inside I18nProvider')
  return c
}
