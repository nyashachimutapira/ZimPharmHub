# MongoDB Setup Guide for ZimPharmHub

## Choose Your MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Easiest & Recommended)

Best for: Development and production deployment to Vercel

#### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google
4. Create organization and project

#### Step 2: Create a Cluster
1. Click "Create Deployment"
2. Choose "Free" tier (M0)
3. Select region (pick closest to you)
4. Wait for cluster to deploy (2-3 minutes)

#### Step 3: Create Database User
1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. Username: `zimpharmhub` (any name)
4. Password: Generate strong password (save it!)
5. Click "Add User"

#### Step 4: Add IP Whitelist
1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - *For production: Add specific Vercel IP*
4. Click "Confirm"

#### Step 5: Get Connection String
1. Click "Database" → "Connect"
2. Choose "Drivers"
3. Select "Node.js"
4. Copy connection string

Example:
```
mongodb+srv://zimpharmhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub?retryWrites=true&w=majority
```

#### Step 6: Update `.env`
Replace `YOUR_PASSWORD` with your actual password:

```env
USE_MONGODB=true
MONGODB_URI=mongodb+srv://zimpharmhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub?retryWrites=true&w=majority
NODE_ENV=development
DATABASE_URL=dummy
```

---

### Option 2: MongoDB Local (Windows)

Best for: Pure local development without internet

#### Step 1: Install MongoDB Community Edition

**Using Chocolatey (Recommended):**
```bash
# Open PowerShell as Administrator and run:
choco install mongodb-community

# Restart PowerShell
```

**Manual Download:**
1. Go to https://www.mongodb.com/try/download/community
2. Choose Windows MSI
3. Run installer
4. Accept defaults
5. Check "Install MongoDB Compass" (optional but useful)

#### Step 2: Verify Installation
```bash
mongod --version
# Should output version number
```

#### Step 3: Start MongoDB Service
```bash
# PowerShell as Administrator:
net start MongoDB

# Or start MongoDB server manually:
mongod
# Keeps running in terminal
```

#### Step 4: Update `.env`
```env
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
NODE_ENV=development
DATABASE_URL=dummy
```

#### Step 5: Verify Connection
```bash
# In another terminal:
mongo
# Should connect to MongoDB
```

---

## Complete `.env` Setup

### For MongoDB Atlas:
```env
# MongoDB Configuration
USE_MONGODB=true
MONGODB_URI=mongodb+srv://zimpharmhub:PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub?retryWrites=true&w=majority
NODE_ENV=development
DATABASE_URL=dummy

# Optional
JWT_SECRET=your_jwt_secret
PORT=5000
```

### For MongoDB Local:
```env
# MongoDB Configuration
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
NODE_ENV=development
DATABASE_URL=dummy

# Optional
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## Start Server

After updating `.env`:

```bash
npm run server
```

Expected output:
```
✅ MongoDB connected (legacy)
✅ Using MongoDB - Sequelize disabled
🚀 Server running on port 5000
```

---

## Test MongoDB Connection

### Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Paste connection string
3. Click "Connect"
4. Browse databases and collections

### Using MongoDB CLI
```bash
# Connect to local MongoDB
mongo

# Or connect to Atlas
mongo "mongodb+srv://zimpharmhub:PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub"

# Inside mongo shell:
show databases
use zimpharmhub
show collections
```

### Using curl to test API
```bash
# Create a user (basic test)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "userType": "job_seeker"
  }'
```

---

## Switch Between Databases

### To use Sequelize + PostgreSQL (Vercel)
```env
USE_MONGODB=false
DATABASE_URL=postgresql://...
```

### To use MongoDB
```env
USE_MONGODB=true
MONGODB_URI=mongodb+srv://...
DATABASE_URL=dummy
```

Just restart server:
```bash
npm run server
```

---

## MongoDB Collections Used

Your existing models use these collections:

```
zimpharmhub
├── users
├── jobs
├── applications
├── products
├── pharmacies
├── messages
├── conversations
├── forumposts
├── articles
├── events
├── newsletters
├── notifications
├── advertisements
├── savedJobs
├── jobalerts
├── savedSearches
├── savedFilters
├── resumes
├── auditlegs
```

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:27017"
**Solution:**
- MongoDB not running locally
- Start with: `net start MongoDB` (Windows) or `mongod`
- Or switch to MongoDB Atlas

### Error: "Authentication failed"
**Solution:**
- Wrong password in connection string
- Double-check username and password
- Reset password in MongoDB Atlas if needed

### Error: "Invalid connection string"
**Solution:**
- Check URL encoding of password (special chars)
- If password has `@`, `#`, or `%`, encode it:
  - Replace `@` with `%40`
  - Replace `#` with `%23`
  - Replace `%` with `%25`

### Error: "Timeout waiting for socket"
**Solution:**
- Network access not allowed in MongoDB Atlas
- Check "Network Access" → add your IP
- For development: Allow "0.0.0.0/0" (anywhere)

---

## Production Deployment to Vercel

Even with MongoDB, you can deploy to Vercel:

### Step 1: Ensure MongoDB Atlas is used
```env (Vercel)
USE_MONGODB=true
MONGODB_URI=mongodb+srv://zimpharmhub:PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub?retryWrites=true&w=majority
NODE_ENV=production
DATABASE_URL=dummy
```

### Step 2: Whitelist Vercel IPs
In MongoDB Atlas:
1. Network Access → Add IP Address
2. Add Vercel's IP ranges (or use 0.0.0.0/0 for simplicity)

### Step 3: Deploy
```bash
git add .
git commit -m "Setup MongoDB"
git push
```

Vercel will use the environment variables automatically.

---

## Recommended: Use Both (Flexibility)

You can use **MongoDB for development** and **PostgreSQL for production**:

### Local Development (.env):
```env
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
NODE_ENV=development
```

### Production (Vercel env vars):
```env
USE_MONGODB=false
DATABASE_URL=postgres://...
NODE_ENV=production
```

This gives you the best of both worlds!

---

## Next Steps

1. Choose MongoDB Atlas or Local
2. Add connection string to `.env`
3. Run `npm run server`
4. Test API endpoints
5. Deploy to Vercel when ready

---

## Useful Commands

```bash
# Start server
npm run server

# Test API
curl http://localhost:5000/api/health

# View MongoDB (Compass)
# Open MongoDB Compass app → paste connection string

# View MongoDB (CLI)
mongo "your_connection_string"
```

**Happy coding!** 🚀
