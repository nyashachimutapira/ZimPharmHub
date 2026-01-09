# Troubleshooting Guide - Connection Refused

## Problem: ERR_CONNECTION_REFUSED

This means the server isn't running. Follow these steps:

## Step 1: Make Sure You're in the Right Directory

Open PowerShell/Terminal and navigate to the project root:
```powershell
cd "C:\Users\Bishop Nyasha\OneDrive\ZimPharmHub\ZimPharmHub"
```

## Step 2: Check if .env File Exists

Make sure you have a `.env` file in the root directory with your Vercel Postgres connection string (see ENV_SETUP.md).

## Step 3: Start the Server

You have two options:

### Option A: Run Both Frontend and Backend Together
```bash
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

### Option B: Run Separately (Two Terminals)

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Step 4: Wait for Success Messages

You should see:
- ✅ "Server running on port 5000" (backend)
- ✅ "Compiled successfully!" (frontend)
- ✅ "webpack compiled" (frontend)

## Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

## Common Issues

### Issue 1: "Cannot find module"
**Solution:**
```bash
npm install
cd client
npm install
```

### Issue 2: "Port 5000 already in use"
**Solution (Windows PowerShell):**
```powershell
netstat -ano | findstr :5000
# Note the PID number, then:
taskkill /PID <PID_NUMBER> /F
```

Or change port in `.env`:
```env
PORT=5001
```

### Issue 3: "Database connection error"
**Solution:**
- Check `.env` file has correct `DATABASE_URL`
- Verify Vercel Postgres is running (check Vercel dashboard)
- Test connection: `node -e "require('dotenv').config(); const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message));"`

### Issue 4: Frontend won't start
**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

## Quick Check Commands

```bash
# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version

# Test Vercel Postgres connection
node -e "require('dotenv').config(); const s = require('./config/database'); s.authenticate().then(() => console.log('✅ DB OK')).catch(e => console.log('❌', e.message));"
```

## Still Having Issues?

1. Check terminal/console for error messages
2. Make sure all dependencies are installed
3. Verify your `.env` file has `DATABASE_URL`
4. Check Vercel dashboard to ensure Postgres is active
5. Try restarting your terminal
6. See **VERCEL_POSTGRES_MIGRATION.md** for detailed database setup

