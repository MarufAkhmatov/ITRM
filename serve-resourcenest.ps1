# ResourceNest - resilient watchdog.
# Started by a Scheduled Task at logon (registered by
# install-resourcenest.ps1). Keeps backend + frontend alive across reboots.
$ErrorActionPreference = 'SilentlyContinue'
$proj = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $proj

function PortUp([int]$port) {
    [bool](Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
}

function StartBackend {
    if (PortUp 8077) { return }
    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-Command',
        "Set-Location '$proj'; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8077 --log-level warning"
    )
}

function StartFrontend {
    if (PortUp 5173) { return }
    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-Command',
        "Set-Location '$proj'; npm run dev -- --host 0.0.0.0 --port 5173"
    )
}

while ($true) {
    StartBackend
    StartFrontend
    Start-Sleep -Seconds 15
}
