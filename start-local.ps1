# ITRM — local launcher.
# Boots the backend and the frontend, and tells you the LAN URL to open
# from your phone on the same Wi-Fi (no tunnel needed).

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

# Find a usable LAN IPv4 (skip loopback, APIPA, virtual adapters by default)
$ip = (Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp |
        Where-Object { $_.IPAddress -notlike '169.254.*' } |
        Select-Object -First 1).IPAddress
if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 |
           Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
           Select-Object -First 1).IPAddress
}

Write-Host "Starting ITRM backend (FastAPI) on http://0.0.0.0:8077 ..." -ForegroundColor Cyan
$backend = Start-Process -PassThru -WindowStyle Minimized -FilePath python `
    -ArgumentList '-m','uvicorn','backend.main:app','--host','0.0.0.0','--port','8077','--log-level','warning'

Start-Sleep -Seconds 2

Write-Host "Starting ITRM frontend (Vite) on http://0.0.0.0:5173 ..." -ForegroundColor Cyan
$frontend = Start-Process -PassThru -WindowStyle Minimized -FilePath npm `
    -ArgumentList 'run','dev','--','--host','0.0.0.0','--port','5173'

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  ITRM is running"                              -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  This computer :  http://127.0.0.1:5173"
if ($ip) {
    Write-Host "  Phone (Wi-Fi) :  http://$ip:5173"          -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Tip: if the phone can't connect, run this once in an admin PowerShell:"
Write-Host "      New-NetFirewallRule -DisplayName 'ITRM 5173' -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow"
Write-Host ""
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

try {
    Wait-Process -Id $frontend.Id
} finally {
    try { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue } catch {}
    try { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue } catch {}
}
