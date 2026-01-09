# Vercel Postgres Migration Guide

This guide explains how to migrate from Render PostgreSQL to Vercel Postgres.

## What Changed

- **Removed**: All Render PostgreSQL connections and individual database parameters
- **Removed**: Support for local PostgreSQL fallback (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`)
- **Updated**: Database connection to use only `DATABASE_URL` environment variable
- **Updated**: All SSL connections are now enforced (required for Vercel Postgres)

## Step 1: Set Up Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create one)
3. Go to the **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Follow the setup wizard and create a new Postgres database

## Step 2: Get Your Connection String

After creating the database:

1. In Vercel Dashboard, go to Storage → Your Postgres Database
2. Click the database name
3. Go to the **.env.local** tab
4. Copy the `POSTGRES_URL_NON_POOLING` or `POSTGRES_URL` string
   - Use `POSTGRES_URL_NON_POOLING` for better compatibility
5. Or use the full connection string visible in the "Connection String" tab

Example format:
```
postgres://user:password@host/dbname
```

## Step 3: Update Environment Variables

Replace your `.env` file with:

```env
# Vercel Postgres Database
DATABASE_URL=postgres://user:password@your-vercel-host/your_database

# Node environment
NODE_ENV=production

# Server port
PORT=5000

# Other existing variables...
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
MAILGUN_API_KEY=your_mailgun_key
JWT_SECRET=your_jwt_secret
```

**Important**: Remove these old variables:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `DB_DIALECT`

## Step 4: Verify Code Changes

The following files have been updated automatically:

### `config/database.js`
- Now uses only `DATABASE_URL`
- Removed fallback to individual connection parameters
- SSL is always enforced

### `server.js`
- Updated console messages to reference "Vercel Postgres"
- Health check now reports "Vercel Postgres"

## Step 5: Test the Connection

1. Clear your node_modules and reinstall:
```bash
rm -r node_modules package-lock.json
npm install
```

2. Start your server:
```bash
npm run server
```

3. Check console for:
```
✅ Vercel Postgres connected successfully
✅ Database models synchronized
```

4. Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "message": "ZimPharmHub API is running",
  "database": "Vercel Postgres",
  "timestamp": "2025-01-09T..."
}
```

## Step 6: Deploy to Vercel

1. Push your code to GitHub/GitLab
2. Go to Vercel Dashboard → Your Project
3. Go to **Settings** → **Environment Variables**
4. Add `DATABASE_URL` with your Vercel Postgres connection string
5. Deploy with `git push` or manually trigger deployment

## Troubleshooting

### Connection Error: "ECONNREFUSED"
- Verify `DATABASE_URL` is correct
- Check Vercel Postgres status in dashboard
- Ensure database is not in "Sleep" state

### Connection Error: "SSL: CERTIFICATE_VERIFY_FAILED"
- This should not occur as SSL is enforced in code
- If it does, check your connection string format

### Timeout Errors
- Vercel Postgres connection pooling may be needed
- Use `POSTGRES_URL_NON_POOLING` if issues persist
- Check network connectivity from your server

### Database Models Not Syncing
- In development, models auto-sync with `alter: true`
- In production, manual migrations may be needed
- Check database logs in Vercel dashboard

## Migration From Render

If you had data in Render Postgres:

1. **Export data from Render**:
```bash
pg_dump postgres://user:password@render-host/database > backup.sql
```

2. **Import to Vercel Postgres**:
```bash
psql DATABASE_URL < backup.sql
```

3. **Verify data**:
```bash
psql DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## Monitoring

- **Vercel Dashboard**: Storage → Postgres → Logs tab
- **Error Logs**: Check application logs for connection issues
- **Usage Stats**: Monitor CPU, storage, and connections

## Rollback (if needed)

If you need to go back to Render:

1. Revert the code changes:
```bash
git revert HEAD  # or restore the files manually
```

2. Update `.env` with Render connection details
3. Restart the server

## Support

For Vercel Postgres issues:
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Support](https://vercel.com/support)

For ZimPharmHub issues:
- Check `server.js` console output
- Verify database connection string
- Check Vercel dashboard for database status
