# PowerShell wrapper to run the MongoDB migration script and restart the backend server
# Usage: Open PowerShell as appropriate and run from the repo root
# .\backend\scripts\run_migration_and_restart.ps1

$mongosh = "mongosh" # adjust full path if mongosh is not in PATH
$mongoUri = "mongodb://localhost:27017/studysphere" # adjust if necessary
$scriptPath = Join-Path $PSScriptRoot "mongo_reindex_and_normalize.js"

if (-not (Test-Path $scriptPath)) {
  Write-Error "Migration script not found at $scriptPath"
  exit 1
}

Write-Host "Running migration script against $mongoUri"
& $mongosh $mongoUri $scriptPath

if ($LASTEXITCODE -ne 0) {
  Write-Error "mongosh returned non-zero exit code: $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "Migration script completed. Restarting backend server (npm run dev)."
Write-Host "If you use nodemon or pm2, restart according to your workflow."

# Optional: try to stop node processes listening on port 5000, then restart
# WARNING: This will kill node processes on the machine. Use with caution.

$port = 5000
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue | Sort-Object -Unique
if ($processes) {
  foreach ($pid in $processes) {
    try {
      Write-Host "Killing process with PID: $pid"
      taskkill /F /PID $pid | Out-Null
    } catch {
      Write-Warning "Failed to kill PID $pid: $_"
    }
  }
} else {
  Write-Host "No process found listening on port $port"
}

# Restart backend server
Push-Location $PSScriptRoot\..\..
Write-Host "Running: npm run dev"
npm run dev
Pop-Location
