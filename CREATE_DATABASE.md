# Create ZimPharmHub Database - Quick Guide

## Option 1: Automated PowerShell Script (Easiest)

1. **Open PowerShell** in the project root directory

2. **Run this command:**
   ```powershell
   cd database
   .\setup_database.ps1
   ```

3. **Enter your PostgreSQL postgres user password when prompted**

---

## Option 2: Manual Setup with psql (Recommended)

### Step 1: Open PowerShell and connect to PostgreSQL

```powershell
psql -U postgres
```

Enter your postgres password when prompted.

### Step 2: Create the database and user

Run these SQL commands:

```sql
-- Create database
CREATE DATABASE zimpharmhub;

-- Create user (if doesn't exist)
CREATE USER zimpharmuser WITH PASSWORD 'password123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;
```

### Step 3: Exit and connect to the new database

```sql
\q
```

Then:
```powershell
psql -U zimpharmuser -d zimpharmhub
```
(Password: `password123`)

### Step 4: Create tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Then run the tables script. From PowerShell (not in psql):
```powershell
cd "C:\Users\Bishop Nyasha\OneDrive\ZimPharmHub\ZimPharmHub\database"
psql -U zimpharmuser -d zimpharmhub -f create_tables.sql
```
(Enter password: `password123` when prompted)

---

## Option 3: Single Command Setup

From PowerShell in the database folder:

```powershell
# Set password as environment variable (replace with your postgres password)
$env:PGPASSWORD = "your_postgres_password"

# Create database
psql -U postgres -c "CREATE DATABASE zimpharmhub;"

# Create user
psql -U postgres -c "CREATE USER zimpharmuser WITH PASSWORD 'password123';"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;"

# Create tables
$env:PGPASSWORD = "password123"
psql -U zimpharmuser -d zimpharmhub -f create_tables.sql

# Clean up
Remove-Item Env:\PGPASSWORD
```

---

## Verify Database Creation

### Check if database exists:

```powershell
psql -U postgres -c "\l" | Select-String "zimpharmhub"
```

### Connect to database:

```powershell
psql -U zimpharmuser -d zimpharmhub
```

### List tables:

```sql
\dt
```

You should see all tables like: users, jobs, pharmacies, etc.

---

## Update .env File

Make sure your `.env` file has:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zimpharmhub
DB_USER=zimpharmuser
DB_PASSWORD=password123
DB_DIALECT=postgres
```

---

## Test Connection

After creating the database, test it:

```powershell
cd "C:\Users\Bishop Nyasha\OneDrive\ZimPharmHub\ZimPharmHub"
node -e "require('dotenv').config(); const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ Database connected!')).catch(e => console.log('❌ Error:', e.message));"
```

Or start your server and visit:
```
http://localhost:5000/api/auth/test-db
```

---

## Need Help?

If you get errors:
1. Make sure PostgreSQL is running
2. Check that `psql` is in your PATH
3. Verify your postgres user password is correct
4. Check the `SETUP_INSTRUCTIONS.md` file for detailed troubleshooting


