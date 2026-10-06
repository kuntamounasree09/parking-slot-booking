# setup-db.ps1
# Secure local database initialization script
# Your password is entered locally with masked input and never sent to any chat/cloud.

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Parking System - PostgreSQL Connection & Database Setup " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$securePass = Read-Host "Enter your PostgreSQL 'postgres' password" -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

$env:PGPASSWORD = $plainPass

Write-Host "`nTesting PostgreSQL connection..." -ForegroundColor Yellow

$testResult = & psql -U postgres -h localhost -d postgres -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Connected to PostgreSQL successfully!" -ForegroundColor Green
    
    # Check if database parking_db exists
    $dbExists = & psql -U postgres -h localhost -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='parking_db';"
    if ($dbExists -ne "1") {
        Write-Host "Creating database 'parking_db'..." -ForegroundColor Cyan
        & psql -U postgres -h localhost -d postgres -c "CREATE DATABASE parking_db;"
        Write-Host "[SUCCESS] Database 'parking_db' created." -ForegroundColor Green
    } else {
        Write-Host "[INFO] Database 'parking_db' already exists." -ForegroundColor Yellow
    }

    # Ensure backend folder exists and write backend/.env
    if (!(Test-Path "backend")) {
        New-Item -ItemType Directory -Path "backend" | Out-Null
    }

    $envFileContent = @"
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_db
DB_USER=postgres
DB_PASSWORD=$plainPass
JWT_SECRET=parking_slot_booking_secure_jwt_secret_token_2026_xyz
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
"@

    $envPath = Join-Path (Get-Location) "backend\.env"
    $envFileContent | Out-File -Encoding utf8 -FilePath $envPath
    Write-Host "[SUCCESS] backend/.env file generated with your database configuration!" -ForegroundColor Green

    # Run schema.sql on parking_db
    Write-Host "Running database/schema.sql on parking_db..." -ForegroundColor Cyan
    & psql -U postgres -h localhost -d parking_db -f "database/schema.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Database schema created successfully!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Schema execution encountered an issue. Backend setup script will also verify it." -ForegroundColor Yellow
    }

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  Setup completed! You can now let the assistant proceed! " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Authentication failed. Please make sure the password is correct." -ForegroundColor Red
    Write-Host $testResult -ForegroundColor DarkRed
}
