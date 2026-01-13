# MongoDB Setup - Visual Guide

## 🎯 Choose Your Path

```
┌─────────────────────────────────────────────────────┐
│         How will you use MongoDB?                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  A) Cloud (MongoDB Atlas)    B) Local (Windows)    │
│  ✅ No setup needed          ⚙️ Install software   │
│  ✅ Works anywhere           ✅ Works offline      │
│  ✅ Free tier available      ✅ Full control       │
│  ⚡ Recommended for start    ⚙️ Requires setup     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🌐 Path A: MongoDB Atlas (Cloud) - Fastest

### Step 1️⃣: Visit MongoDB Atlas
```
https://www.mongodb.com/cloud/atlas
            ↓
        Sign Up (Free)
            ↓
   Choose: Sign up with Google
```

### Step 2️⃣: Create Cluster
```
┌──────────────────────────┐
│ Create Deployment        │
├──────────────────────────┤
│ ✓ Select "Free" tier     │
│ ✓ Pick your region       │
│ ✓ Click Create           │
│ ⏳ Wait 2-3 minutes      │
└──────────────────────────┘
```

### Step 3️⃣: Create Database User
```
┌──────────────────────────┐
│ Database Access          │
├──────────────────────────┤
│ Username: zimpharmhub    │
│ Password: [Generate]     │
│ Click: Add User          │
└──────────────────────────┘
```

### Step 4️⃣: Add IP Whitelist
```
┌──────────────────────────┐
│ Network Access           │
├──────────────────────────┤
│ Add IP Address: 0.0.0.0/0│
│ (Allow Access from Anywhere)
│ Confirm                  │
└──────────────────────────┘
```

### Step 5️⃣: Get Connection String
```
Database → Connect → Drivers → Node.js
            ↓
mongodb+srv://zimpharmhub:PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub?retryWrites=true&w=majority
            ↓
     Copy & Save This!
```

### Step 6️⃣: Update `.env`
```env
USE_MONGODB=true
MONGODB_URI=mongodb+srv://zimpharmhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub?retryWrites=true&w=majority
NODE_ENV=development
DATABASE_URL=dummy
```

### Step 7️⃣: Start Server
```bash
npm run server

# Expected output:
# ✅ MongoDB connected (legacy)
# ✅ Using MongoDB - Sequelize disabled
# 🚀 Server running on port 5000
```

✅ **DONE!**

---

## ⚙️ Path B: MongoDB Local (Windows)

### Step 1️⃣: Install MongoDB
```
Open PowerShell as Administrator
            ↓
choco install mongodb-community
            ↓
Wait for installation (5 min)
            ↓
Restart PowerShell
```

### Step 2️⃣: Verify Installation
```bash
mongod --version

# Should output version like:
# db version v5.0.14
```

### Step 3️⃣: Start MongoDB Service
```bash
# Option A: Windows Service (Recommended)
net start MongoDB

# Option B: Manual Start (Terminal)
mongod
# Keeps running in terminal, don't close
```

### Step 4️⃣: Verify Connection
```bash
# In another terminal:
mongo

# Should connect:
# MongoDB shell version v5.0.14
# connecting to: mongodb://127.0.0.1:27017/?compressors=disabled
# Current Mongosh Log ID: ...
# Type "help" for help
```

### Step 5️⃣: Update `.env`
```env
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
NODE_ENV=development
DATABASE_URL=dummy
```

### Step 6️⃣: Start Server
```bash
npm run server

# Expected output:
# ✅ MongoDB connected (legacy)
# ✅ Using MongoDB - Sequelize disabled
# 🚀 Server running on port 5000
```

✅ **DONE!**

---

## 🧪 Test Your Setup

### Test 1: Check Server Health
```bash
curl http://localhost:5000/api/health

# Response:
{
  "message": "ZimPharmHub API is running",
  "database": "Vercel Postgres",
  "timestamp": "2024-01-10T..."
}
```

### Test 2: Create a User (in Postman)
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "userType": "job_seeker"
}

# Should return 200 with user data
```

### Test 3: View Database (MongoDB Compass)
```
1. Download: https://www.mongodb.com/products/compass
2. Open MongoDB Compass
3. Paste connection string
4. Click Connect
5. Browse: zimpharmhub → users → see your test user
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│     Your Application (Node.js)          │
├─────────────────────────────────────────┤
│                                         │
│  Express Routes                         │
│         ↓                               │
│  Mongoose Models (MongoDB-specific)     │
│         ↓                               │
│  MongoDB Connection                     │
│         ↓                               │
│  MongoDB Atlas Cloud  OR  Local mongod  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 How to Switch Databases

### Currently Using MongoDB? Switch to PostgreSQL:
```env
# Change from:
USE_MONGODB=true
MONGODB_URI=...

# To:
USE_MONGODB=false
DATABASE_URL=postgresql://...

# Restart:
npm run server
```

### Currently Using PostgreSQL? Switch to MongoDB:
```env
# Change from:
USE_MONGODB=false
DATABASE_URL=...

# To:
USE_MONGODB=true
MONGODB_URI=...

# Restart:
npm run server
```

---

## 🚀 Deploy to Vercel

### If Using MongoDB Atlas:
```bash
1. Push code to GitHub
   git add .
   git commit -m "Setup MongoDB"
   git push

2. In Vercel Dashboard:
   - New Project → Import from Git
   - Select your repo
   - Add Environment Variables:
     USE_MONGODB=true
     MONGODB_URI=your_connection_string
     NODE_ENV=production

3. Deploy!
```

### Vercel will automatically:
```
✅ Install dependencies
✅ Connect to MongoDB Atlas
✅ Start your server
✅ Assign domain (yourapp.vercel.app)
```

---

## ⚠️ Troubleshooting

### "ERR_INVALID_ARG_TYPE"
```
❌ Problem: DATABASE_URL missing
✅ Solution: Add DATABASE_URL=dummy to .env
```

### "connection refused"
```
❌ Problem: MongoDB not running locally
✅ Solution: 
  - Start service: net start MongoDB
  - Or use MongoDB Atlas instead
```

### "Authentication failed"
```
❌ Problem: Wrong password
✅ Solution:
  - Check password in connection string
  - Special chars need URL encoding (@→%40)
  - Reset password in MongoDB Atlas
```

### "connect ETIMEDOUT"
```
❌ Problem: MongoDB Atlas network access blocked
✅ Solution:
  - Go to Network Access
  - Add your IP or 0.0.0.0/0
  - Wait 5 minutes for change to apply
```

---

## 📋 Quick Checklist

### MongoDB Atlas Setup
- [ ] Created MongoDB Atlas account
- [ ] Created free cluster
- [ ] Created database user
- [ ] Added IP whitelist (0.0.0.0/0)
- [ ] Got connection string
- [ ] Added to `.env`
- [ ] Started server
- [ ] API responding

### MongoDB Local Setup
- [ ] Installed MongoDB
- [ ] Verified installation (mongod --version)
- [ ] Started MongoDB service (net start MongoDB)
- [ ] Added connection string to `.env`
- [ ] Started server
- [ ] API responding

---

## 🎯 Success Criteria

### ✅ You're Done When:
```
1. npm run server runs without errors
2. Output shows: "✅ MongoDB connected"
3. curl http://localhost:5000/api/health returns 200
4. Can create test user via API
5. Can see data in MongoDB Compass/CLI
```

---

## 📚 More Help

- **Detailed setup:** `MONGODB_SETUP.md`
- **Quick reference:** `MONGODB_QUICKSTART.md`
- **What changed:** `MONGODB_CHANGES_SUMMARY.md`

---

**Ready?** Pick Path A or B above and follow the steps! 🚀
