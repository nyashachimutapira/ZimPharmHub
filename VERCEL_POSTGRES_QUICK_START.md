# Vercel Postgres Quick Start

Fast setup guide for ZimPharmHub with Vercel Postgres.

## 1. Get Your Connection String (2 minutes)

1. Go to https://vercel.com/dashboard
2. Storage → Create Database → Postgres
3. Follow setup wizard
4. Copy connection string from .env.local tab
5. Format: `postgres://user:password@host/database`

## 2. Update .env File (1 minute)

```env
DATABASE_URL=postgres://your-user:your-password@your-host/your-database
PORT=5000
NODE_ENV=development
JWT_SECRET=your-random-secret-key-here
```

Remove these (they no longer work):
- ❌ DB_HOST
- ❌ DB_USER
- ❌ DB_PASSWORD
- ❌ DB_NAME
- ❌ DB_PORT

## 3. Test Connection (1 minute)

```bash
npm install
node -e "require('dotenv').config(); const s = require('./config/database'); s.authenticate().then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message));"
```

## 4. Start Server (30 seconds)

```bash
npm run server
```

Look for:
```
✅ Vercel Postgres connected successfully
✅ Database models synchronized
🚀 Server running on port 5000
```

## 5. Test API (30 seconds)

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "message": "ZimPharmHub API is running",
  "database": "Vercel Postgres",
  "timestamp": "2025-01-09T..."
}
```

## Common Issues

### "Cannot find module 'sequelize'"
```bash
npm install
npm run server
```

### "DATABASE_URL is not defined"
- Check .env file exists
- Check DATABASE_URL line is not commented
- Restart server

### "Connection refused"
- Verify connection string is correct
- Check Vercel Postgres status in dashboard
- Make sure database isn't sleeping

### "SSL certificate error"
- Should not happen with Vercel Postgres
- Update connection string format if needed
- Contact Vercel support

## Deployment to Vercel

```bash
git push origin main
# Then in Vercel Dashboard:
# 1. Add DATABASE_URL to Environment Variables
# 2. Click Deploy
```

## Data Migration from Render

```bash
# Export from Render
pg_dump YOUR_RENDER_CONNECTION_STRING > backup.sql

# Import to Vercel
psql YOUR_VERCEL_DATABASE_URL < backup.sql
```

## What Changed

### Old Way (Render + Individual Parameters)
```env
DB_HOST=dpg-xxx.render.com
DB_USER=user
DB_PASSWORD=pass
DB_NAME=db
DB_PORT=5432
```

### New Way (Vercel Postgres)
```env
DATABASE_URL=postgres://user:password@host/db
```

## Troubleshooting Checklist

- [ ] .env file exists in root directory
- [ ] DATABASE_URL is set (not commented out)
- [ ] No old DB_HOST, DB_USER variables in .env
- [ ] npm install completed
- [ ] Vercel Postgres database created
- [ ] Connection string matches Vercel format
- [ ] NODE_ENV is not 'production' during development

## Next Steps

1. ✅ Connection working locally
2. 📦 Deploy to Vercel (see VERCEL_DEPLOYMENT_GUIDE.md)
3. 🔐 Set up custom domain (optional)
4. 📧 Configure email service (optional)
5. 💳 Set up Stripe (optional)

## Resources

- **Full Migration Guide**: VERCEL_POSTGRES_MIGRATION.md
- **Deployment Guide**: VERCEL_DEPLOYMENT_GUIDE.md
- **Troubleshooting**: TROUBLESHOOTING.md
- **Vercel Docs**: https://vercel.com/docs/storage/vercel-postgres

## Still Stuck?

1. Check console output for specific error message
2. Read the full migration guide
3. Contact Vercel support if database issue
4. Check GitHub issues if code issue

## Key Commands Reference

```bash
# Test database connection
node -e "require('dotenv').config(); const s = require('./config/database'); s.authenticate().then(() => console.log('✅ OK')).catch(e => console.log('❌', e.message));"

# Start server
npm run server

# Start frontend
cd client && npm start

# Install dependencies
npm install

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test API
curl http://localhost:5000/api/health
```

That's it! You're ready to go. 🚀
