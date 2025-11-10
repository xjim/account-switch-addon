param(
    [string]$ApiKey = "",
    [string]$ApiSecret = ""
)

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "Error: Please provide API Key" -ForegroundColor Red
    Write-Host "Usage: .\sign_xpi.ps1 -ApiKey 'xxx' -ApiSecret 'yyy'"
    exit 1
}

Write-Host "Start signing extension..." -ForegroundColor Green

# Backup and swap manifest files
Write-Host "Backing up manifest.json and swapping with manifest-firefox.json..." -ForegroundColor Yellow
if (Test-Path ".\manifest.json") {
    Rename-Item -Path ".\manifest.json" -NewName ".\manifest.bak" -Force
    Write-Host "✓ manifest.json backed up as manifest.bak"
}
if (Test-Path ".\manifest-firefox.json") {
    Copy-Item -Path ".\manifest-firefox.json" -Destination ".\manifest.json" -Force
    Write-Host "✓ manifest-firefox.json copied to manifest.json"
}

# Set environment variables
$env:WEB_EXT_API_KEY = $ApiKey
$env:WEB_EXT_API_SECRET = $ApiSecret

# Execute signing
web-ext sign --channel unlisted --source-dir .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Signing successful!" -ForegroundColor Green
    Write-Host "Signed file location: .\web-ext-artifacts\" -ForegroundColor Yellow
    
    # List generated files
    ls .\web-ext-artifacts\
} else {
    Write-Host "Signing failed" -ForegroundColor Red
}

# Restore original manifest files
Write-Host "Restoring original manifest files..." -ForegroundColor Yellow
if (Test-Path ".\manifest.json") {
    Remove-Item -Path ".\manifest.json" -Force
    Write-Host "✓ manifest.json removed"
}
if (Test-Path ".\manifest.bak") {
    Rename-Item -Path ".\manifest.bak" -NewName ".\manifest.json" -Force
    Write-Host "✓ manifest.bak restored to manifest.json"
}

if ($LASTEXITCODE -eq 0) {
    exit 0
} else {
    exit 1
}