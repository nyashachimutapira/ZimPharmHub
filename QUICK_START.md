# Quick Start Guide - ZimPharmHub

## Step-by-Step Setup Instructions

### 1. Prerequisites Check
Make sure you have installed:
- ✅ Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- ✅ MongoDB (local or Atlas account) - [Download here](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
- ✅ Git (if cloning from repository)

### 2. Install Dependencies

Open a terminal in the project root directory (`ZimPharmHub`):

**Backend dependencies:**
```bash
npm install
```

**Frontend dependencies:**
```bash
cd client
npm install
cd ..
```

### 3. Set Up Environment Variables

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Then edit the `.env` file and update these values:
```
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
JWT_SECRET=your-random-secret-key-12345
PORT=5000
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB service is running
# Windows: MongoDB should start automatically as a service
# Or run manually:
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string (replace password and database name)
4. Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zimpharmhub
```

### 5. Run the Application

**Option 1: Run Both Together (Recommended)**
```bash
npm run dev
```
This starts both backend (port 5000) and frontend (port 3000) simultaneously.

**Option 2: Run Separately**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

### 6. Access the Application

- 🌐 **Frontend:** Open your browser and go to http://localhost:3000
- 🔧 **Backend API:** http://localhost:5000/api/health (to test if backend is running)

### 7. Create Your First Account

1. Go to http://localhost:3000/register
2. Fill in the registration form
3. Choose user type: **Job Seeker** or **Pharmacy**
4. Login and explore!

### 8. Test the Features

**As a Job Seeker:**
- View jobs at `/jobs`
- Apply for jobs
- Check your dashboard at `/dashboard`
- Save jobs for later

**As a Pharmacy:**
- Post job listings
- View applications received
- Manage your pharmacy profile
- Check dashboard at `/dashboard`

**Admin Access:**
- To create an admin user, manually set `userType: 'admin'` in MongoDB or register first user and update in database

---

## Common Issues & Solutions

### ❌ "MongoDB connection error"
**Solution:**
- Make sure MongoDB is running: `mongod` or check Windows Services
- Check your `MONGODB_URI` in `.env` file
- For Atlas: Check your IP is whitelisted

### ❌ "Port 5000 already in use"
**Solution:**
```bash
# Windows PowerShell:
netstat -ano | findstr :5000
# Find PID and kill:
taskkill /PID <PID> /F

# Or change port in .env:
PORT=5001
```

### ❌ "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Same for client:
cd client
rm -rf node_modules package-lock.json
npm install
```

### ❌ "npm run dev not working"
**Solution:**
Make sure you're in the root directory (not in `client` folder):
```bash
# Should be in: ZimPharmHub/
npm run dev
```

---

## Project Structure

```
ZimPharmHub/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # All page components
│   │   ├── components/ # Reusable components
│   │   └── App.js      # Main app file
│   └── package.json
├── models/             # MongoDB models
├── routes/             # API routes
├── server.js           # Express server
├── package.json        # Backend dependencies
└── .env                # Environment variables (create this!)
```

---

## Next Steps After Setup

1. ✅ **Register** - Create your account
2. ✅ **Explore** - Browse jobs, products, forum
3. ✅ **Dashboard** - Check your personalized dashboard
4. ✅ **Messages** - Test the messaging system
5. ✅ **Notifications** - See notifications in action

---

## Need Help?

- Check `SETUP.md` for detailed documentation
- Check `README.md` for API endpoints
- Review error messages in terminal/console
- Check MongoDB connection status

Happy coding! 🚀

