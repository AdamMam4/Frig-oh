# Clear all Python cache files and bytecode
# Run this script whenever you make changes to Python files and want to ensure a clean restart

Write-Host "Clearing Python cache files..." -ForegroundColor Yellow

# Remove all .pyc files
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
Write-Host "✓ Removed .pyc files" -ForegroundColor Green

# Remove all __pycache__ directories
Get-ChildItem -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
Write-Host "✓ Removed __pycache__ directories" -ForegroundColor Green

# Kill all Python processes
Get-Process python* -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
Write-Host "✓ Stopped all Python processes" -ForegroundColor Green

Write-Host "`nCache cleared successfully! You can now restart your backend server." -ForegroundColor Cyan
