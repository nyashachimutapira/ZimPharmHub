# Deployment Guide

## Deploy to Render (Recommended)

### One-Click Deployment
1. Go to https://render.com
2. Sign up or log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select `ZimPharmHub` repository
6. Render will auto-detect `render.yaml` configuration
7. Add environment variables (see below)
8. Click "Create Web Service"

### Environment Variables to Set
In Render dashboard → Environment:

```
DATABASE_URL=postgresql://neondb_owner:npg_yJK62LQMPBfn@ep-falling-art-aha1uemj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgresql://neondb_owner:npg_yJK62LQMPBfn@ep-falling-art-aha1uemj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=[Your actual password]
POSTGRES_DATABASE=neondb
POSTGRES_HOST=ep-falling-art-aha1uemj-pooler.c-3.us-east-1.aws.neon.tech
NODE_ENV=production
CI=false
```

### What Happens Automatically
- Installs dependencies
- Builds React frontend
- Starts Node server
- Health checks every 30s at `/api/health`
- Auto-scales if needed

---

## Deploy to Vercel (Alternative)

### Setup
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure settings:
   - Framework: Other
   - Build command: `cd client && npm install && npm run build`
   - Output directory: `client/build`

### Environment Variables
Add the same environment variables from above in Vercel project settings

---

## Deploy to Railway (Alternative)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Railway will detect `server.js` and start automatically

---

## Local Testing Before Deploy

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build React
cd client && npm run build && cd ..

# Test production build locally
npm start
```

Visit `http://localhost:3001` to test

---

## Database

- **Provider**: Neon (PostgreSQL)
- **Auto-sync**: Tables auto-create on first boot
- **Force sync**: Run `node forceSyncDatabase.js` locally if needed

---

## Troubleshooting

- **Build fails**: Check that `DATABASE_URL` is set correctly
- **App won't start**: Check server logs at `/logs` in dashboard
- **Database connection error**: Verify Neon credentials in environment variables
- **React not loading**: Ensure `client/build` folder exists after build

