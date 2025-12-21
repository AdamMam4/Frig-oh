# Start the React front for this project (Windows PowerShell)
# Usage: open PowerShell in repo root and run: .\scripts\start-front.ps1

# Ensure script runs from repo root (script location)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir\..\

# Check for Node and npm
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH. Install from https://nodejs.org/ and retry."
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not available. Ensure Node.js installation provides npm."
    exit 1
}

# Default API URL if not set in environment
if (-not $env:REACT_APP_API_BASE_URL -or $env:REACT_APP_API_BASE_URL -eq '') {
    $env:REACT_APP_API_BASE_URL = 'http://localhost:8000'
}

Write-Host "Using REACT_APP_API_BASE_URL = $env:REACT_APP_API_BASE_URL"

# Install deps and start
Write-Host "Installing front-end dependencies (may take a few minutes)..."
npm install

Write-Host "Starting React dev server... (CTRL+C to stop)"
npm start
