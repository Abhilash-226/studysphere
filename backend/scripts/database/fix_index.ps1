# PowerShell script to fix conversation index issue
# This script will attempt to connect to MongoDB and fix the participants index

Write-Host "=== StudySphere Conversation Index Fix ===" -ForegroundColor Green

# Try different MongoDB client commands
$mongoCommands = @("mongosh", "mongo", "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe", "C:\Program Files\MongoDB\Server\6.0\bin\mongo.exe")
$mongoCmd = $null

foreach ($cmd in $mongoCommands) {
    try {
        $null = Get-Command $cmd -ErrorAction Stop
        $mongoCmd = $cmd
        Write-Host "Found MongoDB client: $mongoCmd" -ForegroundColor Yellow
        break
    } catch {
        continue
    }
}

if (-not $mongoCmd) {
    Write-Host "MongoDB client not found. Please ensure MongoDB is installed and in PATH." -ForegroundColor Red
    Write-Host "Available options:" -ForegroundColor Yellow
    Write-Host "1. Install MongoDB and add to PATH"
    Write-Host "2. Use MongoDB Compass GUI to run the following commands:"
    Write-Host ""
    Write-Host "// Drop old index" -ForegroundColor Cyan
    Write-Host "db.conversations.dropIndex('participants_1')" -ForegroundColor White
    Write-Host ""
    Write-Host "// Normalize participants" -ForegroundColor Cyan
    Write-Host 'db.conversations.find({participants: {$size: 2}}).forEach(function(doc) {' -ForegroundColor White
    Write-Host "  var sorted = doc.participants.map(p => p.toString()).sort();" -ForegroundColor White
    Write-Host "  if (doc.participants[0].toString() !== sorted[0] || doc.participants[1].toString() !== sorted[1]) {" -ForegroundColor White
    Write-Host '    db.conversations.updateOne({_id: doc._id}, {$set: {participants: sorted}});' -ForegroundColor White
    Write-Host "  }" -ForegroundColor White
    Write-Host "});" -ForegroundColor White
    Write-Host ""
    Write-Host "// Create new index" -ForegroundColor Cyan
    Write-Host "db.conversations.createIndex({'participants.0': 1, 'participants.1': 1}, {unique: true})" -ForegroundColor White
    exit 1
}

# Run the migration script
$scriptPath = Join-Path $PSScriptRoot "fix_conversation_index.js"
if (Test-Path $scriptPath) {
    Write-Host "Running migration script..." -ForegroundColor Yellow
    & $mongoCmd "mongodb://localhost:27017/studysphere" $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "You can now restart your backend server." -ForegroundColor Yellow
    } else {
        Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "Migration script not found at: $scriptPath" -ForegroundColor Red
}
