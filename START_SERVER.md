# How to Start the Server - Quick Fix

## Issue 1: Port 5000 Already in Use

### Windows PowerShell - Kill Process on Port 5000:

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with the number from above command)
taskkill /PID <PID> /F
```

**Or use this one-liner:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

**Or change the port in .env:**
```env
PORT=5001
```

## Issue 2: Missing react-scripts

The client dependencies aren't installed. Run:

```powershell
cd client
npm install
cd ..
```

## Complete Fix Steps:

1. **Kill port 5000:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

2. **Install client dependencies:**
```powershell
cd client
npm install
cd ..
```

3. **Start the server:**
```powershell
npm run dev
```

## Alternative: Change Port

If you can't kill the process, change the port:

1. Update `.env` file:
```env
PORT=5001
```

2. Update `client/package.json` proxy:
```json
"proxy": "http://localhost:5001"
```

3. Then run:
```powershell
npm run dev
```



