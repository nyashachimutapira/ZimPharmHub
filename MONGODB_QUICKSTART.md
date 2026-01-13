# MongoDB Quick Start (5 Minutes)

## Fastest Way: MongoDB Atlas Cloud

### 1. Sign Up (2 minutes)
```
👉 Go to: https://www.mongodb.com/cloud/atlas
👉 Click "Try Free"
👉 Sign up with Google or email
```

### 2. Create Free Cluster (2 minutes)
```
1. Click "Create Deployment"
2. Choose "Free" tier
3. Select region
4. Wait for green "READY" status
```

### 3. Get Connection String (1 minute)
```
1. Click "Database" → "Connect"
2. Choose "Drivers" 
3. Copy the connection string (starts with mongodb+srv://)
4. Replace <password> with your database password
```

### 4. Update `.env` (1 minute)
```env
USE_MONGODB=true
MONGODB_URI=mongodb+srv://zimpharmhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/zimpharmhub?retryWrites=true&w=majority
NODE_ENV=development
DATABASE_URL=dummy
```

### 5. Start Server
```bash
npm run server
```

✅ **Done!** You should see:
```
✅ MongoDB connected (legacy)
✅ Using MongoDB - Sequelize disabled
🚀 Server running on port 5000
```

---

## If Using Local MongoDB Instead

### 1. Install MongoDB
```bash
# Windows (Administrator PowerShell):
choco install mongodb-community
```

### 2. Start MongoDB
```bash
# Administrator PowerShell:
net start MongoDB

# Or in terminal:
mongod
```

### 3. Update `.env`
```env
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
NODE_ENV=development
DATABASE_URL=dummy
```

### 4. Start Server
```bash
npm run server
```

---

## Test It Works

### Using Postman/Insomnia
```
POST http://localhost:5000/api/health
```

Should return:
```json
{
  "message": "ZimPharmHub API is running",
  "database": "Vercel Postgres",
  "timestamp": "2024-01-10T..."
}
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `ERR_INVALID_ARG_TYPE` | Add `DATABASE_URL=dummy` to `.env` |
| `connection refused` | Start MongoDB locally or use Atlas |
| `Authentication failed` | Wrong password in connection string |
| `connect ETIMEDOUT` | Check network access in MongoDB Atlas |

---

## That's It! 🎉

Your server is now using MongoDB. All existing routes work the same way.

Next: Deploy to Vercel anytime by pushing to git.

```bash
git add .
git commit -m "Setup MongoDB"
git push
```

---

**Need help?** See `MONGODB_SETUP.md` for detailed instructions.
