# Vercel Deployment Guide

Complete guide for deploying ZimPharmHub to Vercel with Vercel Postgres.

## Prerequisites

- GitHub/GitLab account with your ZimPharmHub repository
- Vercel account (free at https://vercel.com)
- Vercel Postgres database set up

## Step 1: Prepare Your Code

### 1.1 Verify database configuration
```bash
node -e "require('dotenv').config(); const s = require('./config/database'); s.authenticate().then(() => console.log('✅ DB OK')).catch(e => console.log('❌', e.message));"
```

### 1.2 Test the server locally
```bash
npm install
npm run server
```

Should show:
```
✅ Vercel Postgres connected successfully
✅ Database models synchronized
🚀 Server running on port 5000
```

### 1.3 Commit and push to GitHub
```bash
git add .
git commit -m "Switch to Vercel Postgres"
git push origin main
```

## Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Select your GitHub repository containing ZimPharmHub
4. Click **Import**

## Step 3: Configure Environment Variables

1. After importing, you'll see **Environment Variables** section
2. Add the following variables:

### Required Variables:
```env
DATABASE_URL=postgres://user:password@your-vercel-host/your-database
```

### Optional but Recommended:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-random-key-here

# If using Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# If using email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend
FRONTEND_URL=https://your-domain.com
```

## Step 4: Database Configuration

### Option A: Vercel Postgres (Recommended)

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Follow the setup wizard
4. Copy the connection string to `DATABASE_URL` environment variable

### Option B: External PostgreSQL

If using an external database (e.g., AWS RDS, Railway):
1. Get your connection string
2. Add as `DATABASE_URL` environment variable in Vercel

## Step 5: Configure Build & Runtime

In the project settings:

1. **Framework Preset**: Node.js
2. **Build Command**: (leave empty - uses package.json)
3. **Install Command**: `npm install`
4. **Output Directory**: (leave empty)
5. **Development Command**: `npm run server`

## Step 6: Deploy

### Automatic Deployment
Push to your repository and Vercel will automatically deploy:
```bash
git push origin main
```

### Manual Deployment
1. In Vercel Dashboard, click **Deploy**
2. Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Step 7: Verify Deployment

1. Check deployment logs in Vercel Dashboard
2. Visit your deployment URL (usually `https://zimpharmhub.vercel.app`)
3. Test the API health endpoint:
```bash
curl https://your-deployment.vercel.app/api/health
```

Expected response:
```json
{
  "message": "ZimPharmHub API is running",
  "database": "Vercel Postgres",
  "timestamp": "2025-01-09T..."
}
```

## Step 8: Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → Settings
2. Go to **Domains**
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Deployment Fails with "DATABASE_URL not found"
- Check Environment Variables section
- Ensure `DATABASE_URL` is set correctly
- Redeploy after adding environment variables

### "Vercel Postgres connection error"
- Verify `DATABASE_URL` format is correct
- Check Vercel Postgres status in Storage tab
- Ensure database is not in "Sleep" state
- Check Vercel logs for detailed error

### Build Fails
```bash
# Check locally first
npm install
npm run server

# Check package.json scripts are correct
# Make sure all dependencies are in package.json
npm list --depth=0
```

### Database Models Not Syncing
- In production, models don't auto-sync with `alter: true`
- You may need to manually run migrations
- Contact support for database schema issues

## Monitoring & Logs

### View Deployment Logs
1. In Vercel Dashboard, click your project
2. Go to **Deployments** tab
3. Click the deployment
4. View **Logs**

### Database Logs
1. Go to **Storage** → Your Postgres Database
2. Click **Logs** tab
3. View database activity and errors

## Frontend Deployment

If deploying frontend separately:

1. In `client` directory:
```bash
cd client
npm run build
```

2. Deploy to Vercel:
   - Create new Vercel project from `client` directory
   - Or use Monorepo configuration

3. Update `FRONTEND_URL` environment variable on backend

## Troubleshooting Connection Issues

### Local Development Still Works?
```bash
npm run server
node -e "require('dotenv').config(); const s = require('./config/database'); s.authenticate().then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message));"
```

### Check if PORT is set correctly
- Vercel automatically assigns PORT 3000 or 5000
- No need to manually set PORT in environment

### Database Connection Pooling
- For high traffic, use Vercel's connection pooling
- Vercel Postgres handles this automatically

## Scaling & Performance

### Connection Limits
- Vercel Postgres free tier: 20 connections
- Pro tier: 100 connections
- Use connection pooling for more

### Database Backups
- Vercel Postgres creates automatic backups
- Check Storage → Backups in Vercel Dashboard

### Monitoring
- Check Vercel Dashboard for CPU/memory usage
- Monitor database query performance
- Set up alerts for errors

## Costs

### Vercel
- **Hobby Plan**: $0 (includes 12x Serverless Function hours/month)
- **Pro Plan**: $20/month (includes 1000x hours)

### Vercel Postgres
- **Free**: 0-2GB storage, included
- **Paid**: Based on storage and data transfers

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **ZimPharmHub Issues**: Check your GitHub repository

## Rollback

If deployment fails:
1. In Vercel Dashboard, go to **Deployments**
2. Find the previous working deployment
3. Click **Promote to Production**

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure email service (Mailgun, SendGrid, etc.)
3. Set up Stripe webhooks
4. Enable HTTPS (automatic with Vercel)
5. Monitor performance and errors
6. Set up automated backups
