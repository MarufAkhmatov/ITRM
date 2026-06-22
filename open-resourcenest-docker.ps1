# ResourceNest (Docker mode) - desktop launcher.
# Starts Docker Desktop if needed, brings the ITRM compose stack up, opens
# the app via the LAN URL so the QR on the login page is phone-reachable.
$ErrorActionPreference = 'SilentlyContinue'
$proj = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $proj

function DaemonUp { docker info 2>$null | Out-Null; return $? }

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

# 1) Make sure Docker Desktop is up.
if (-not (DaemonUp)) {
    $dd = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dd) { Start-Process $dd }
    for ($i=0; $i -lt 90; $i++) { if (DaemonUp) { break }; Start-Sleep -Seconds 2 }
}

# 2) Bring the compose stack up (idempotent).
if (DaemonUp) {
    docker compose -f (Join-Path $proj 'docker-compose.yml') up -d 2>$null | Out-Null
}

# 3) Firewall rule for LAN access on :5173 (idempotent).
if (-not (Get-NetFirewallRule -DisplayName 'ResourceNest 5173' -ErrorAction SilentlyContinue)) {
    try {
        New-NetFirewallRule -DisplayName 'ResourceNest 5173' -Direction Inbound `
            -Action Allow -Protocol TCP -LocalPort 5173 -Profile Any | Out-Null
    } catch {}
}

# 4) Wait for the API to answer.
for ($i=0; $i -lt 45; $i++) {
    try {
        $r = Invoke-WebRequest -Uri 'http://localhost:8077/api/health' -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep -Milliseconds 700
}

# 5) Open the LAN URL so the QR on the login page is reachable from a phone.
$ip = Get-LanIPv4
$url = if ($ip) { "http://$ip`:5173/login" } else { 'http://127.0.0.1:5173/login' }
Start-Process $url
