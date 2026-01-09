# Database Setup Instructions

## Quick Setup (Windows PowerShell)

1. **Open PowerShell as Administrator** (optional, but recommended)

2. **Navigate to the database folder:**
   ```powershell
   cd "C:\Users\Bishop Nyasha\OneDrive\ZimPharmHub\ZimPharmHub\database"
   ```

3. **Run the setup script:**
   ```powershell
   .\setup_database.ps1
   ```

   This will:
   - Create the `zimpharmhub` database
   - Create the `zimpharmuser` user
   - Grant necessary privileges
   - Create all tables

4. **Enter your PostgreSQL postgres user password when prompted**

---

## Manual Setup (Alternative Method)

### Method 1: Using psql Command Line

1. **Open PowerShell or Command Prompt**

2. **Connect to PostgreSQL:**
   ```powershell
   psql -U postgres
   ```
   Enter your postgres password when prompted.

3. **Run the SQL commands:**
   ```sql
   -- Create database
   CREATE DATABASE zimpharmhub;
   
   -- Create user (if doesn't exist)
   CREATE USER zimpharmuser WITH PASSWORD 'password123';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;
   ```

4. **Connect to the new database:**
   ```sql
   \c zimpharmhub
   ```

5. **Grant schema privileges:**
   ```sql
   GRANT ALL ON SCHEMA public TO zimpharmuser;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zimpharmuser;
   ```

6. **Create tables:**
   ```sql
   \i create_tables.sql
   ```
   Or from command line:
   ```powershell
   psql -U zimpharmuser -d zimpharmhub -f create_tables.sql
   ```

---

### Method 2: Using pgAdmin (GUI)

1. **Open pgAdmin**

2. **Right-click on "Databases" → Create → Database**
   - Name: `zimpharmhub`
   - Owner: `postgres`
   - Click "Save"

3. **Right-click on "Login/Group Roles" → Create → Login/Group Role**
   - Name: `zimpharmuser`
   - Go to "Definition" tab → Password: `password123`
   - Go to "Privileges" tab → Check "Can login?" and "Create databases"
   - Click "Save"

4. **Grant privileges:**
   - Right-click on `zimpharmhub` database → Properties
   - Go to "Security" tab → Add user `zimpharmuser`
   - Grant all privileges

5. **Create tables:**
   - Right-click on `zimpharmhub` → Query Tool
   - Open `create_tables.sql` file
   - Execute the script (F5)

---

## Verify Setup

### Test Database Connection:

```powershell
psql -U zimpharmuser -d zimpharmhub
```

You should be able to connect. Then run:
```sql
\dt
```

You should see all the tables listed.

### Test from Node.js:

```bash
cd "C:\Users\Bishop Nyasha\OneDrive\ZimPharmHub\ZimPharmHub"
node -e "require('dotenv').config(); const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ Connected!')).catch(e => console.log('❌ Error:', e.message));"
```

---

## Troubleshooting

### Error: "role 'zimpharmuser' does not exist"
**Solution:** Create the user first:
```sql
CREATE USER zimpharmuser WITH PASSWORD 'password123';
```

### Error: "database 'zimpharmhub' does not exist"
**Solution:** Create the database first:
```sql
CREATE DATABASE zimpharmhub;
```

### Error: "permission denied"
**Solution:** Make sure you're running as postgres superuser or grant proper privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;
GRANT ALL ON SCHEMA public TO zimpharmuser;
```

### Error: "psql: command not found"
**Solution:** Add PostgreSQL bin directory to your PATH:
- Find PostgreSQL installation (usually `C:\Program Files\PostgreSQL\XX\bin`)
- Add it to Windows PATH environment variable

---

## After Setup

1. **Update .env file** (if needed):
   ```env
   DB_NAME=zimpharmhub
   DB_USER=zimpharmuser
   DB_PASSWORD=password123
   DB_HOST=localhost
   DB_PORT=5432
   ```

2. **Restart your backend server:**
   ```bash
   npm run dev
   ```

3. **Test the connection:**
   Visit: `http://localhost:5000/api/auth/test-db`

You should see a success message with user count!



