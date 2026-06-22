# ResourceNest (local mode) - desktop launcher.
# Started by the ResourceNest desktop icon. Boots the backend + frontend (if
# not already running) and opens the login page in the default browser.
$ErrorActionPreference = 'SilentlyContinue'
$proj = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $proj

function PortUp([int]$port) {
    [bool](Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
}
function Get-LanIPv4 {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp -ErrorAction SilentlyContinue |
           Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
           Select-Object -First 1 -ExpandProperty IPAddress)
    if (-not $ip) {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
               Where-Object { $_.IPAddress -match '^(192\.168\.|10\.|172\.)' } |
               Select-Object -First 1 -ExpandProperty IPAddress)
    }
    return $ip
}

# ---- Bootstrap deps on first run ----
if (-not (Test-Path 'node_modules')) {
    Write-Host 'Installing npm dependencies (first run)...' -ForegroundColor Cyan
    & npm install --no-audit --no-fund | Out-Null
}
try { & python -c "import fastapi,uvicorn,xlrd,openpyxl,bs4" 2>$null } catch {}
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Installing Python dependencies (first run)...' -ForegroundColor Cyan
    & python -m pip install -q -r backend/requirements.txt | Out-Null
}

# ---- Start backend (FastAPI) ----
if (-not (PortUp 8077)) {
    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-Command',
        "Set-Location '$proj'; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8077 --log-level warning"
    )
}

# ---- Start frontend (Vite) ----
if (-not (PortUp 5173)) {
    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-Command',
        "Set-Location '$proj'; npm run dev -- --host 0.0.0.0 --port 5173"
    )
}

# ---- Wait for the front to come up ----
for ($i=0; $i -lt 60; $i++) { if (PortUp 5173) { break }; Start-Sleep -Milliseconds 500 }

$ip = Get-LanIPv4
$url = if ($ip) { "http://$ip`:5173/login" } else { 'http://127.0.0.1:5173/login' }
Start-Process $url
