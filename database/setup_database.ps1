# ZimPharmHub Database Setup Script for Windows
# Run this script in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZimPharmHub Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "ERROR: PostgreSQL not found in PATH!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or add it to your PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "PostgreSQL found!" -ForegroundColor Green
Write-Host ""

# Get database credentials
Write-Host "Enter PostgreSQL superuser (postgres) password:" -ForegroundColor Yellow
$postgresPassword = Read-Host -AsSecureString
$postgresPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword)
)

# Set environment variable for password
$env:PGPASSWORD = $postgresPasswordPlain

Write-Host ""
Write-Host "Step 1: Creating database..." -ForegroundColor Yellow

# Create database
$createDbQuery = "CREATE DATABASE zimpharmhub;"
try {
    psql -U postgres -c $createDbQuery
    Write-Host "Database 'zimpharmhub' created successfully!" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -match "already exists") {
        Write-Host "Database 'zimpharmhub' already exists. Continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "Error creating database: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Creating user..." -ForegroundColor Yellow

# Create user (if doesn't exist)
$createUserQuery = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'zimpharmuser') THEN
    CREATE USER zimpharmuser WITH PASSWORD 'password123';
  END IF;
END
`$`$;
"@

try {
    psql -U postgres -c $createUserQuery
    Write-Host "User 'zimpharmuser' created/verified!" -ForegroundColor Green
} catch {
    Write-Host "Error creating user: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Granting privileges..." -ForegroundColor Yellow

# Grant privileges
$grantQuery = "GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;"
psql -U postgres -c $grantQuery
Write-Host "Privileges granted!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Creating tables..." -ForegroundColor Yellow

# Create tables
$tablesFile = Join-Path $PSScriptRoot "create_tables.sql"
if (Test-Path $tablesFile) {
    # Set password for zimpharmuser
    $env:PGPASSWORD = "password123"
    
    psql -U zimpharmuser -d zimpharmhub -f $tablesFile
    Write-Host "Tables created successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR: create_tables.sql not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file with:" -ForegroundColor White
Write-Host "   DB_NAME=zimpharmhub" -ForegroundColor Gray
Write-Host "   DB_USER=zimpharmuser" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=password123" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your backend server" -ForegroundColor White
Write-Host ""

# Clean up
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue



