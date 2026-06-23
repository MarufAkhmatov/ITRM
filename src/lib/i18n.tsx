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
  'nav.amir':               { en: 'AMIR Copilot',         ru: 'Помощник AMIR',   uz: 'AMIR yordamchi' },

  // topbar
  'topbar.title':           { en: 'IT Resource Management — Executive Analytics',
                              ru: 'Управление ИТ-ресурсами — аналитика для руководства',
                              uz: 'IT resurslarini boshqarish — rahbariyat uchun tahlil' },
  'topbar.refresh':         { en: 'Refresh filters', ru: 'Обновить фильтры', uz: 'Filtrlarni yangilash' },
  'topbar.export_xlsx':     { en: 'Export XLSX',     ru: 'Экспорт XLSX',     uz: 'XLSX ga yuklab olish' },
  'topbar.export_csv':      { en: 'CSV',             ru: 'CSV',              uz: 'CSV' },
  'topbar.toggle_theme':    { en: 'Toggle theme',    ru: 'Переключить тему', uz: 'Mavzuni almashtirish' },
  'topbar.language':        { en: 'Language',        ru: 'Язык',             uz: 'Til' },
  'topbar.logout':          { en: 'Log out',         ru: 'Выйти',            uz: 'Chiqish' },

  // login
  'login.title':            { en: 'Sign in to ITRM',
                              ru: 'Вход в ITRM',
                              uz: 'ITRM ga kirish' },
  'login.subtitle':         { en: 'Enter your administrator credentials.',
                              ru: 'Введите учётные данные администратора.',
                              uz: 'Administrator maʼlumotlarini kiriting.' },
  'login.username':         { en: 'Username',        ru: 'Логин',            uz: 'Login' },
  'login.password':         { en: 'Password',        ru: 'Пароль',           uz: 'Parol' },
  'login.submit':           { en: 'Sign in',         ru: 'Войти',            uz: 'Kirish' },
  'login.error':            { en: 'Invalid username or password.',
                              ru: 'Неверный логин или пароль.',
                              uz: 'Login yoki parol notoʻgʻri.' },
  'login.default_hint':     { en: 'Default: admin / Admin2026',
                              ru: 'По умолчанию: admin / Admin2026',
                              uz: 'Standart: admin / Admin2026' },
  'login.qr_title':         { en: 'Open on phone (same Wi-Fi)',
                              ru: 'Открыть на телефоне (одна Wi-Fi)',
                              uz: 'Telefonda ochish (bitta Wi-Fi)' },
  'login.qr_help':          { en: 'Scan the QR code with your phone’s camera. Your phone must be on the same Wi-Fi as this computer.',
                              ru: 'Отсканируйте QR-код камерой телефона. Телефон должен быть в той же Wi-Fi-сети.',
                              uz: 'QR kodni telefon kamerasi bilan skanerlang. Telefon shu kompyuter bilan bitta Wi-Fi tarmoqda boʻlishi kerak.' },

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

  // executive drill-down panels
  'dd.monthly_volume':      { en: 'Monthly volume',     ru: 'Динамика по месяцам', uz: 'Oylik hajm' },
  'dd.by_type':             { en: 'By request type',    ru: 'По типу запроса',     uz: 'Soʻrov turi boʻyicha' },
  'dd.by_env':              { en: 'By environment',     ru: 'По среде',            uz: 'Muhit boʻyicha' },
  'dd.top_depts':           { en: 'Top departments',    ru: 'Топ подразделений',   uz: 'Eng faol boʻlimlar' },
  'dd.top_depts_req':       { en: 'Top departments (requests)', ru: 'Топ подразделений (по запросам)', uz: 'Eng faol boʻlimlar (soʻrovlar)' },
  'dd.top_depts_overall':   { en: 'Top departments overall', ru: 'Топ подразделений (в целом)', uz: 'Umumiy boʻyicha eng faol boʻlimlar' },
  'dd.status_breakdown':    { en: 'Status breakdown',   ru: 'Разбивка по статусам', uz: 'Statuslar boʻyicha taqsimot' },
  'dd.status_mix':          { en: 'Status mix',         ru: 'Структура статусов',  uz: 'Statuslar tarkibi' },
  'dd.fulfillment_rate':    { en: 'Fulfillment rate',   ru: 'Уровень выполнения',  uz: 'Bajarish darajasi' },
  'dd.fulfillment_help':    { en: '{n} of {tot} requests delivered.',
                              ru: 'Из {tot} запросов выполнено {n}.',
                              uz: '{tot} soʻrovdan {n} tasi bajarilgan.' },
  'dd.rejection_rate':      { en: 'Rejection rate',     ru: 'Уровень отклонения',  uz: 'Rad etish darajasi' },
  'dd.rejection_help':      { en: '{n} of {tot} requests rejected.',
                              ru: 'Из {tot} запросов отклонено {n}.',
                              uz: '{tot} soʻrovdan {n} tasi rad etilgan.' },
  'dd.monthly_trend':       { en: 'Monthly trend (requests + allocated resources)',
                              ru: 'Динамика (запросы + выделенные ресурсы)',
                              uz: 'Oylik dinamika (soʻrovlar + ajratilgan resurslar)' },
  'dd.avg_lead':            { en: 'Average lead time',  ru: 'Среднее время решения', uz: 'Oʻrtacha hal qilish vaqti' },
  'dd.avg_cycle':           { en: 'Average cycle time', ru: 'Среднее время цикла', uz: 'Oʻrtacha sikl vaqti' },
  'dd.req_by_status':       { en: 'Requests by status', ru: 'Запросы по статусам', uz: 'Holatlar boʻyicha soʻrovlar' },
  'dd.req_by_type':         { en: 'Requests by type',   ru: 'Запросы по типам',    uz: 'Turlar boʻyicha soʻrovlar' },
  'dd.requested':           { en: 'Requested',          ru: 'Запрошено',           uz: 'Talab qilingan' },
  'dd.allocated':           { en: 'Allocated',          ru: 'Выделено',            uz: 'Ajratilgan' },
  'dd.gap':                 { en: 'Gap (requested - allocated)',
                              ru: 'Разница (запрошено - выделено)',
                              uz: 'Farq (talab - ajratilgan)' },
  'dd.gap_of_demand':       { en: '{p}% of demand',     ru: '{p}% от спроса',      uz: 'talabning {p}%' },
  'dd.monthly_demand':      { en: 'Monthly demand trend', ru: 'Динамика спроса',   uz: 'Oylik talab dinamikasi' },
  'dd.top_consumers':       { en: 'Top consuming departments',
                              ru: 'Топ потребляющих подразделений',
                              uz: 'Eng koʻp sarflaydigan boʻlimlar' },
  'dd.col.department':      { en: 'Department',         ru: 'Подразделение',       uz: 'Boʻlim' },
  'dd.col.sum':             { en: 'Σ {unit}',           ru: 'Σ {unit}',            uz: 'Σ {unit}' },
  // small list labels in TotalDetail
  'dd.fulfilled':           { en: 'Fulfilled',          ru: 'Выполнено',           uz: 'Bajarildi' },
  'dd.rejected':            { en: 'Rejected',           ru: 'Отклонено',           uz: 'Rad etildi' },
  'dd.open':                { en: 'Open',               ru: 'Открыто',             uz: 'Ochiq' },
  'dd.closed':              { en: 'Closed',             ru: 'Закрыто',             uz: 'Yopilgan' },

  // departments
  'dept.title':             { en: 'Department Analytics', ru: 'Аналитика по подразделениям', uz: 'Boʻlimlar tahlili' },
  'dept.subtitle':          { en: 'Consumption, growth and ranking across {n} departments.',
                              ru: 'Потребление, рост и рейтинг по {n} подразделениям.',
                              uz: '{n} ta boʻlim boʻyicha sarflash, oʻsish va reyting.' },
  'dept.top_req':           { en: 'Top by Requests',  ru: 'Топ по запросам',     uz: 'Soʻrovlar boʻyicha top' },
  'dept.top_ram':           { en: 'Top by RAM (GB)',  ru: 'Топ по RAM (ГБ)',     uz: 'RAM (GB) boʻyicha top' },
  'dept.heatmap':           { en: 'Department × Month Heatmap (top 15)', ru: 'Тепловая карта: подразделения × месяц (топ-15)', uz: 'Issiqlik xaritasi: boʻlim × oy (top 15)' },
  'dept.all':               { en: 'All Departments',  ru: 'Все подразделения',  uz: 'Barcha boʻlimlar' },
  'dept.col.department':    { en: 'Department',       ru: 'Подразделение',      uz: 'Boʻlim' },
  'dept.col.requests':      { en: 'Requests',         ru: 'Запросы',            uz: 'Soʻrovlar' },
  'dept.col.cpu':           { en: 'CPU vCPU',         ru: 'CPU vCPU',           uz: 'CPU vCPU' },
  'dept.col.ram':           { en: 'RAM GB',           ru: 'RAM, ГБ',            uz: 'RAM, GB' },
  'dept.col.storage':       { en: 'Storage GB',       ru: 'Хранилище, ГБ',      uz: 'Xotira, GB' },
  'dept.col.top_env':       { en: 'Top Env',          ru: 'Топ-среда',          uz: 'Top muhit' },
  'dept.col.top_type':      { en: 'Top Request Type', ru: 'Топ тип запроса',    uz: 'Top soʻrov turi' },

  // request type
  'rt.monthly_volume':      { en: 'Monthly Volume',   ru: 'Ежемесячный объём',  uz: 'Oylik hajm' },
  'rt.by_status':           { en: 'By Status',        ru: 'По статусам',        uz: 'Holatlar boʻyicha' },
  'rt.by_env':              { en: 'By Environment',   ru: 'По средам',          uz: 'Muhitlar boʻyicha' },
  'rt.by_priority':         { en: 'By Priority',      ru: 'По приоритетам',     uz: 'Muhimlik boʻyicha' },
  'rt.top_depts':           { en: 'Top Departments',  ru: 'Топ подразделений',  uz: 'Eng faol boʻlimlar' },
  'rt.requests':            { en: 'Requests',         ru: 'Запросы',            uz: 'Soʻrovlar' },
  'rt.col.key':             { en: 'Key',              ru: 'Ключ',               uz: 'Kalit' },
  'rt.col.summary':         { en: 'Summary',          ru: 'Тема',               uz: 'Mavzu' },
  'rt.col.status':          { en: 'Status',           ru: 'Статус',             uz: 'Holat' },
  'rt.col.priority':        { en: 'Priority',         ru: 'Приоритет',          uz: 'Muhimlik' },
  'rt.col.department':      { en: 'Department',       ru: 'Подразделение',      uz: 'Boʻlim' },
  'rt.col.env':             { en: 'Env',              ru: 'Среда',              uz: 'Muhit' },
  'rt.col.cpu':             { en: 'CPU',              ru: 'CPU',                uz: 'CPU' },
  'rt.col.ram':             { en: 'RAM',              ru: 'RAM',                uz: 'RAM' },
  'rt.col.storage':         { en: 'Storage',          ru: 'Хранилище',          uz: 'Xotira' },
  'rt.col.created':         { en: 'Created',          ru: 'Создано',            uz: 'Yaratildi' },
  'rt.allocated':           { en: 'Allocated',        ru: 'Выделено',           uz: 'Ajratilgan' },
  'rt.summary.total':       { en: 'Total',            ru: 'Всего',              uz: 'Jami' },
  'rt.summary.fulfilled':   { en: 'fulfilled',        ru: 'выполнено',          uz: 'bajarildi' },

  // upload
  'up.format':              { en: 'Format',           ru: 'Формат',             uz: 'Format' },
  'up.rows_in_file':        { en: 'Rows in file',     ru: 'Строк в файле',      uz: 'Fayldagi qatorlar' },
  'up.valid':               { en: 'Valid',            ru: 'Валидных',           uz: 'Yaroqli' },
  'up.quarantined':         { en: 'Quarantined',      ru: 'В карантине',        uz: 'Karantinda' },
  'up.req_types':           { en: 'Request types',    ru: 'Типы запросов',      uz: 'Soʻrov turlari' },
  'up.depts':               { en: 'Departments',      ru: 'Подразделения',      uz: 'Boʻlimlar' },
  'up.status_counts':       { en: 'Status counts',    ru: 'Статусы',            uz: 'Holatlar' },
  'up.req_type_counts':     { en: 'Request type counts', ru: 'Типы запросов',   uz: 'Soʻrov turlari' },
  'up.top_depts':           { en: 'Top departments',  ru: 'Топ подразделений',  uz: 'Eng faol boʻlimlar' },
  'up.columns_mapped':      { en: 'Columns auto-mapped', ru: 'Сопоставленные колонки', uz: 'Avtomatik moslangan ustunlar' },
  'up.no_uploads':          { en: 'No uploads yet.',  ru: 'Загрузок пока нет.', uz: 'Hozircha yuklash yoʻq.' },
  'up.ingested':            { en: 'Ingested {n} rows from {f}',
                              ru: 'Загружено {n} строк из {f}',
                              uz: '{f} dan {n} ta qator yuklandi' },
  'up.activated':           { en: 'Activated',        ru: 'Активирована',       uz: 'Faollashtirildi' },
  'up.upload_failed':       { en: 'Upload failed: {e}', ru: 'Ошибка загрузки: {e}', uz: 'Yuklash xatosi: {e}' },

  // settings
  'set.title':              { en: 'Settings',         ru: 'Настройки',          uz: 'Sozlamalar' },
  'set.subtitle':           { en: 'FinOps cost rates and admin configuration.',
                              ru: 'Финансовые ставки FinOps и админ-настройки.',
                              uz: 'FinOps tarif stavkalari va admin sozlamalari.' },
  'set.cpu_rate':           { en: 'CPU per vCPU / month', ru: 'CPU за vCPU / месяц', uz: 'CPU bittasi uchun / oy' },
  'set.ram_rate':           { en: 'RAM per GB / month', ru: 'RAM за ГБ / месяц', uz: 'RAM per GB / oy' },
  'set.storage_rate':       { en: 'Storage per GB / month', ru: 'Хранилище за ГБ / месяц', uz: 'Xotira per GB / oy' },
  'set.env_mult':           { en: 'Environment multiplier', ru: 'Множитель по средам', uz: 'Muhit koʻpaytirgichi' },
  'set.save':               { en: 'Save rates',       ru: 'Сохранить',          uz: 'Saqlash' },
  'set.saved':              { en: 'Cost rates saved', ru: 'Тарифы сохранены',   uz: 'Stavkalar saqlandi' },
  'set.field_mappings':     { en: 'Field Mappings',   ru: 'Сопоставление полей', uz: 'Maydon moslamalari' },
  'set.field_mappings_help': { en: 'Column auto-mapping and value normalization (status, department, request-type, environment, server-type) run from the dictionaries in backend/ingest/mappings.py. Phase 2 will add an admin UI here to edit these without code changes.',
                              ru: 'Авто-сопоставление колонок и нормализация значений (статус, подразделение, тип запроса, среда, тип сервера) выполняются по словарям из backend/ingest/mappings.py. На Фазе 2 здесь появится админ-UI для их редактирования без правки кода.',
                              uz: 'Ustunlarni avtomatik moslash va qiymatlarni normallashtirish (status, boʻlim, soʻrov turi, muhit, server turi) backend/ingest/mappings.py dagi lugʻatlardan ishlaydi. 2-bosqichda shu yerda kod oʻzgartirmasdan tahrirlash uchun admin UI qoʻshiladi.' },

  // capacity
  'cap.title':              { en: 'Capacity Management', ru: 'Управление ёмкостью', uz: 'Sigʻimni boshqarish' },
  'cap.subtitle':           { en: 'Allocated (from Jira) vs Available (Capacity Registry) — Phase 2.',
                              ru: 'Выделено (из Jira) и Доступно (Реестр ёмкости) — Фаза 2.',
                              uz: 'Ajratilgan (Jira’dan) va Mavjud (Sigʻim reestri) — 2-bosqich.' },
  'cap.phase2_note':        { en: 'Phase 2 module.', ru: 'Модуль Фазы 2.', uz: '2-bosqich moduli.' },
  'cap.phase2_body':        { en: 'The data model and API endpoint /api/capacity are wired and ready to receive manual inventory entries (datacenter / cluster / hypervisor / env / CPU&nbsp;total/used/free, etc). The MVP focuses on demand-side analytics from Jira; capacity-vs-allocated comparison, utilization %, exhaustion forecast and purchase planning land in Phase 2.',
                              ru: 'Модель данных и эндпоинт /api/capacity готовы принимать ручные записи инвентаря (ЦОД / кластер / гипервизор / среда / CPU всего/исп./свободно и т.д.). MVP фокусируется на анализе спроса из Jira; сравнение «выделено vs доступно», % утилизации, прогноз исчерпания и план закупок появятся в Фазе 2.',
                              uz: 'Maʼlumotlar modeli va /api/capacity endpointi qoʻlda inventar yozuvlarini (ma’lumotlar markazi / klaster / gipervizor / muhit / CPU jami/ishlatilgan/boʻsh va h.k.) qabul qilishga tayyor. MVP Jira’dan kelgan talab tahliliga qaratilgan; ajratilgan↔mavjud taqqoslash, foydalanish %, tugash prognozi va xarid rejasi 2-bosqichda qoʻshiladi.' },

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

  // amir
  'amir.title':             { en: 'AMIR — IT Resource Copilot',
                              ru: 'AMIR — ИТ-помощник',
                              uz: 'AMIR — IT yordamchisi' },
  'amir.subtitle':          { en: 'Ask in any language about departments, resources, trends or forecasts. AMIR answers in the language of your question.',
                              ru: 'Спрашивайте на любом языке о подразделениях, ресурсах, трендах и прогнозах. AMIR отвечает на языке вопроса.',
                              uz: 'Boʻlimlar, resurslar, trendlar va prognozlar haqida istalgan tilda soʻrang. AMIR savol tilida javob beradi.' },
  'amir.placeholder':       { en: 'Ask AMIR in EN / RU / UZ…',
                              ru: 'Спросите AMIR на EN / RU / UZ…',
                              uz: 'EN / RU / UZ tillarida AMIR dan soʻrang…' },
  'amir.send':              { en: 'Send',             ru: 'Отправить',          uz: 'Yuborish' },
  'amir.thinking':          { en: 'AMIR is thinking…',ru: 'AMIR думает…',       uz: 'AMIR oʻylanmoqda…' },
  'amir.empty':             { en: 'Try an example above, or type your own question in any language.',
                              ru: 'Попробуйте пример выше или задайте свой вопрос на любом языке.',
                              uz: 'Yuqoridagi misollardan birini sinab koʻring yoki istalgan tilda savolingizni yozing.' },
  'amir.empty_panel':       { en: 'Try one of the suggestions below.',
                              ru: 'Попробуйте один из вариантов ниже.',
                              uz: 'Pastdagi takliflardan birini sinab koʻring.' },

  // AMIR demo suggestions (forecast)
  'amir.suggest.rest_2026': { en: '🔮 Forecast resource demand until end of 2026',
                              ru: '🔮 Прогноз потребления ресурсов до конца 2026',
                              uz: '🔮 2026 yil yakuniga qadar resurs talabi prognozi' },
  'amir.suggest.y2027':     { en: '🔮 Forecast resource demand for 2027',
                              ru: '🔮 Прогноз потребления ресурсов на 2027 год',
                              uz: '🔮 2027 yil uchun resurs talabi prognozi' },

  // Forecast modal
  'fc.title.rest_2026':     { en: 'Forecast — rest of 2026 (Jul-Dec)',
                              ru: 'Прогноз — до конца 2026 (июль-декабрь)',
                              uz: 'Prognoz — 2026 yil yakuniga qadar (iyul-dekabr)' },
  'fc.title.y2027':         { en: 'Forecast — full 2027',
                              ru: 'Прогноз — весь 2027 год',
                              uz: 'Prognoz — toʻliq 2027 yil' },
  'fc.trained_on':          { en: 'Model trained on {n} months ({from} → {to})',
                              ru: 'Модель обучена на {n} мес. ({from} → {to})',
                              uz: 'Model {n} oy boʻyicha oʻrgatildi ({from} → {to})' },
  'fc.expected':            { en: 'Expected',   ru: 'Ожидаемо',  uz: 'Kutilayotgan' },
  'fc.best_case':           { en: 'Best case',  ru: 'Лучший',    uz: 'Eng yaxshi' },
  'fc.worst_case':          { en: 'Worst case', ru: 'Худший',    uz: 'Eng yomon' },
  'fc.history':             { en: 'History',    ru: 'История',   uz: 'Tarix' },
  'fc.projection':          { en: 'Projection', ru: 'Прогноз',   uz: 'Prognoz' },
  'fc.cpu':                 { en: 'CPU',        ru: 'CPU',       uz: 'CPU' },
  'fc.ram':                 { en: 'RAM',        ru: 'RAM',       uz: 'RAM' },
  'fc.storage':             { en: 'Storage',    ru: 'Хранилище', uz: 'Xotira' },

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
