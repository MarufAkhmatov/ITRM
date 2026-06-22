# ResourceNest - install resilient auto-start (run once).
# Mirrors the SLANEST pattern from the ITSM-SLA project:
#   1) Scheduled Task at logon that keeps backend+frontend alive (watchdog).
#   2) Firewall rule for LAN access on :5173 (phones on the same Wi-Fi).
#   3) Desktop icon "ResourceNest" (local mode launcher).
#   4) Desktop icon "ResourceNest (Docker)" (docker-compose launcher).
#   5) Startup-folder shortcut so the server boots with Windows.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-resourcenest.ps1

$ErrorActionPreference = 'Stop'
$proj  = Split-Path -Parent $MyInvocation.MyCommand.Path
$watch = Join-Path $proj 'serve-resourcenest.ps1'
$open  = Join-Path $proj 'open-resourcenest.ps1'
$openD = Join-Path $proj 'open-resourcenest-docker.ps1'

$watchArg = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$watch`""
$openArg  = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$open`""
$openDArg = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$openD`""

# ---- 1) Scheduled Task: keep server alive at logon ----
try {
    $action  = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $watchArg
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $set     = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
        -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
        -ExecutionTimeLimit (New-TimeSpan -Seconds 0)
    Register-ScheduledTask -TaskName 'ResourceNest' -Action $action -Trigger $trigger `
        -Settings $set -Description 'ResourceNest (ITRM) resilient server' -Force | Out-Null
    Start-ScheduledTask -TaskName 'ResourceNest' -ErrorAction SilentlyContinue
    Write-Host "Scheduled Task 'ResourceNest' registered + started." -ForegroundColor Green
} catch {
    Write-Host "Scheduled Task registration failed (need admin?). Continuing." -ForegroundColor Yellow
}

# ---- 2) Firewall - let phones on the same Wi-Fi reach :5173 ----
try {
    if (-not (Get-NetFirewallRule -DisplayName 'ResourceNest 5173' -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName 'ResourceNest 5173' -Direction Inbound `
            -Action Allow -Protocol TCP -LocalPort 5173 -Profile Any | Out-Null
        Write-Host "Firewall rule 'ResourceNest 5173' added (LAN)." -ForegroundColor Green
    }
} catch {
    Write-Host "Firewall rule needs admin - run this script as Administrator to enable phone access." -ForegroundColor Yellow
}

# ---- 3+4) Desktop shortcuts ----
$ws  = New-Object -ComObject WScript.Shell
$ico = if (Test-Path "$proj\public\resourcenest.ico") {
    "$proj\public\resourcenest.ico"
} else {
    "$env:SystemRoot\System32\shell32.dll,15"
}

$desktop = [Environment]::GetFolderPath('Desktop')

# Local mode icon
$lnk = $ws.CreateShortcut("$desktop\ResourceNest.lnk")
$lnk.TargetPath       = 'powershell.exe'
$lnk.Arguments        = $openArg
$lnk.WorkingDirectory = $proj
$lnk.IconLocation     = $ico
$lnk.Description      = 'Launch ResourceNest (ITRM) - local mode'
$lnk.Save()
Write-Host "Desktop icon 'ResourceNest' created." -ForegroundColor Green

# Docker mode icon
$lnk2 = $ws.CreateShortcut("$desktop\ResourceNest (Docker).lnk")
$lnk2.TargetPath       = 'powershell.exe'
$lnk2.Arguments        = $openDArg
$lnk2.WorkingDirectory = $proj
$lnk2.IconLocation     = $ico
$lnk2.Description      = 'Launch ResourceNest (ITRM) - Docker compose'
$lnk2.Save()
Write-Host "Desktop icon 'ResourceNest (Docker)' created." -ForegroundColor Green

# ---- 5) Startup-folder shortcut (watchdog) ----
$startup = [Environment]::GetFolderPath('Startup')
$slnk = $ws.CreateShortcut("$startup\ResourceNest (server).lnk")
$slnk.TargetPath       = 'powershell.exe'
$slnk.Arguments        = $watchArg
$slnk.WorkingDirectory = $proj
$slnk.IconLocation     = $ico
$slnk.WindowStyle      = 7
$slnk.Description      = 'ResourceNest background server (auto-start)'
$slnk.Save()
Write-Host "Startup shortcut 'ResourceNest (server)' created." -ForegroundColor Green

Write-Host ''
Write-Host '==============================================' -ForegroundColor Green
Write-Host '  ResourceNest installed.' -ForegroundColor Green
Write-Host '==============================================' -ForegroundColor Green
Write-Host '  Double-click "ResourceNest" on your Desktop to launch ITRM.'
Write-Host '  Login : admin / Admin2026'
Write-Host '  Login page shows a QR code - scan it from a phone on the same Wi-Fi.'
Write-Host ''
