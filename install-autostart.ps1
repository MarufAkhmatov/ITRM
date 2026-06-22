# Creates an "ITRM" shortcut on the Windows Desktop that launches the app
# (backend + frontend + browser) with one double-click.
#
# Usage:
#   Right-click this file → "Run with PowerShell".
#   (If Windows complains about execution policy:
#        powershell -ExecutionPolicy Bypass -File install-autostart.ps1 )

$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$launcher    = Join-Path $projectRoot 'start-local.ps1'
if (-not (Test-Path $launcher)) {
    throw "start-local.ps1 not found next to install-autostart.ps1"
}

$desktop = [Environment]::GetFolderPath('Desktop')
$lnk     = Join-Path $desktop 'ITRM.lnk'

$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut($lnk)
$sc.TargetPath       = 'powershell.exe'
$sc.Arguments        = "-NoExit -ExecutionPolicy Bypass -File `"$launcher`""
$sc.WorkingDirectory = $projectRoot
$sc.Description      = 'Launch ITRM (backend + frontend + browser)'
# Pick a recognizable system icon (server/computer themed).
$sc.IconLocation     = "$env:SystemRoot\System32\shell32.dll,15"
$sc.Save()

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Created Desktop shortcut: ITRM.lnk" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Double-click 'ITRM' on your Desktop to start the app."
Write-Host "  Login : admin / Admin2026"
Write-Host ""

# Optional: allow inbound traffic on 5173 so phones on the same Wi-Fi can connect.
$rule = Get-NetFirewallRule -DisplayName 'ITRM 5173' -ErrorAction SilentlyContinue
if (-not $rule) {
    try {
        New-NetFirewallRule -DisplayName 'ITRM 5173' -Direction Inbound `
            -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private | Out-Null
        Write-Host "Firewall rule 'ITRM 5173' added (Private profile)." -ForegroundColor DarkGray
    } catch {
        Write-Host "Could not add firewall rule (not running as admin?)." -ForegroundColor DarkYellow
        Write-Host "If phones can't connect on Wi-Fi, run this once in an admin PowerShell:" -ForegroundColor DarkYellow
        Write-Host "  New-NetFirewallRule -DisplayName 'ITRM 5173' -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow" -ForegroundColor DarkGray
    }
}
