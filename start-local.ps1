# ITRM local launcher.
# Boots backend (FastAPI) + frontend (Vite), opens the browser, prints the
# Wi-Fi LAN URL so a phone on the same network can scan the QR code.
#
# Usage: right-click → Run with PowerShell — or double-click the Desktop
# shortcut created by install-autostart.ps1.

$ErrorActionPreference = 'Continue'
Set-Location -Path $PSScriptRoot

function Test-Port($port) {
    $tcp = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    return [bool]$tcp
}

function Get-LanIPv4 {
    $candidate = (Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and $_.IPAddress -notlike '172.*' } |
        Sort-Object -Property InterfaceMetric |
        Select-Object -First 1).IPAddress
    if (-not $candidate) {
        $candidate = (Get-NetIPAddress -AddressFamily IPv4 |
            Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
            Select-Object -First 1).IPAddress
    }
    return $candidate
}

# ---- Python deps (first run) ----
$venvOk = $false
try {
    & python -c "import fastapi, uvicorn, xlrd, openpyxl, bs4" 2>$null
    if ($LASTEXITCODE -eq 0) { $venvOk = $true }
} catch {}
if (-not $venvOk) {
    Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
    & python -m pip install -q -r backend/requirements.txt
}

# ---- npm deps (first run) ----
if (-not (Test-Path node_modules)) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    & npm install --no-audit --no-fund
}

# ---- Backend ----
if (Test-Port 8077) {
    Write-Host "Backend already running on :8077"
} else {
    Write-Host "Starting backend on http://0.0.0.0:8077 ..." -ForegroundColor Cyan
    Start-Process -WindowStyle Minimized -FilePath python `
        -ArgumentList '-m','uvicorn','backend.main:app','--host','0.0.0.0','--port','8077','--log-level','warning'
}

# ---- Frontend ----
if (Test-Port 5173) {
    Write-Host "Frontend already running on :5173"
} else {
    Write-Host "Starting frontend on http://0.0.0.0:5173 ..." -ForegroundColor Cyan
    Start-Process -WindowStyle Minimized -FilePath npm `
        -ArgumentList 'run','dev','--','--host','0.0.0.0','--port','5173'
}

# Wait for Vite to come up.
$tries = 0
while (-not (Test-Port 5173) -and $tries -lt 30) {
    Start-Sleep -Milliseconds 500; $tries++
}

$ip = Get-LanIPv4

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  ITRM is running" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  This computer :  http://127.0.0.1:5173"
if ($ip) { Write-Host "  Phone (Wi-Fi) :  http://$ip:5173" -ForegroundColor Yellow }
Write-Host ""
Write-Host "  Default login : admin / Admin2026"
Write-Host ""

# Open the local URL in the default browser.
Start-Process "http://127.0.0.1:5173/login"

Write-Host "(Servers run in minimized windows. Close them to stop ITRM.)" -ForegroundColor DarkGray
Start-Sleep -Seconds 3
