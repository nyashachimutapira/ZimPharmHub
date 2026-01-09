# Vercel Postgres Migration Checklist

Complete checklist for migrating from Render PostgreSQL to Vercel Postgres.

## Pre-Migration

- [ ] Read DATABASE_MIGRATION_SUMMARY.md
- [ ] Backup current database (optional but recommended)
- [ ] Stop current server
- [ ] Create Vercel account if needed
- [ ] Have GitHub/GitLab access

## Phase 1: Vercel Setup (5-10 minutes)

### Create Vercel Postgres Database
- [ ] Go to Vercel Dashboard (https://vercel.com/dashboard)
- [ ] Select your project or create new one
- [ ] Go to **Storage** tab
- [ ] Click **Create Database** → **Postgres**
- [ ] Choose region (closest to your users)
- [ ] Follow setup wizard
- [ ] Database created successfully

### Get Connection String
- [ ] Click on database name
- [ ] Go to **.env.local** tab
- [ ] Copy `POSTGRES_URL_NON_POOLING` (recommended)
- [ ] Format: `postgres://user:password@host/database`
- [ ] Save this string somewhere safe

## Phase 2: Code Verification (2 minutes)

### Check Files Updated
- [ ] `config/database.js` - Uses only DATABASE_URL
- [ ] `server.js` - References "Vercel Postgres"
- [ ] `README.md` - Updated with Vercel info

### Review Documentation Created
- [ ] `VERCEL_POSTGRES_MIGRATION.md` - Exists
- [ ] `VERCEL_DEPLOYMENT_GUIDE.md` - Exists
- [ ] `VERCEL_POSTGRES_QUICK_START.md` - Exists
- [ ] `DATABASE_MIGRATION_SUMMARY.md` - Exists
- [ ] `ENV_SETUP.md` - Updated for Vercel
- [ ] `TROUBLESHOOTING.md` - Updated for Vercel

## Phase 3: Environment Setup (3 minutes)

### Update .env File
- [ ] Open `.env` file in root directory
- [ ] Delete all old variables:
  - [ ] Remove `DB_HOST`
  - [ ] Remove `DB_USER`
  - [ ] Remove `DB_PASSWORD`
  - [ ] Remove `DB_NAME`
  - [ ] Remove `DB_PORT`
  - [ ] Remove `DB_DIALECT`
  - [ ] Remove old `DATABASE_URL` if exists

### Add New Variable
- [ ] Add: `DATABASE_URL=postgres://your-connection-string`
- [ ] Ensure no typos in connection string
- [ ] File saved

### Additional Variables (if needed)
- [ ] `PORT=5000`
- [ ] `NODE_ENV=development`
- [ ] `JWT_SECRET=your-secure-key`
- [ ] Keep other variables (STRIPE, EMAIL, etc.)

## Phase 4: Local Testing (5-10 minutes)

### Install Dependencies
```bash
- [ ] Run: npm install
- [ ] No errors in output
```

### Test Database Connection
```bash
- [ ] Run: node -e "require('dotenv').config(); const s = require('./config/database'); s.authenticate().then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message));"
- [ ] Output shows: ✅ Connected
```

### Start Server
```bash
- [ ] Run: npm run server
- [ ] See: ✅ Vercel Postgres connected successfully
- [ ] See: ✅ Database models synchronized
- [ ] See: 🚀 Server running on port 5000
```

### Test API Endpoints
```bash
- [ ] Run: curl http://localhost:5000/api/health
- [ ] See database field shows: "Vercel Postgres"
- [ ] Status: 200 OK
```

### Test Some API Calls
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/jobs
- [ ] Other critical endpoints

### Check Frontend (if applicable)
```bash
- [ ] cd client && npm start
- [ ] Frontend loads at http://localhost:3000
- [ ] Can interact with backend API
```

## Phase 5: Data Migration (if needed)

### If Coming from Render Postgres

#### Export Render Data
- [ ] Note your Render connection string
- [ ] Run: `pg_dump RENDER_CONNECTION_STRING > backup.sql`
- [ ] File `backup.sql` created successfully
- [ ] File size > 0 bytes

#### Import to Vercel Postgres
- [ ] Run: `psql DATABASE_URL < backup.sql`
- [ ] No errors in output
- [ ] Verify data imported

#### Verify Data
- [ ] Check database has same table count
- [ ] Check record counts match
- [ ] Test queries against migrated data

### If Starting Fresh
- [ ] No data migration needed
- [ ] Database ready for new data

## Phase 6: Git Commit (2 minutes)

### Stage Changes
```bash
- [ ] Run: git status
- [ ] See modified files and new documentation
```

### Create Commit
```bash
- [ ] Run: git add .
- [ ] Run: git commit -m "Migrate from Render to Vercel Postgres"
```

### Push to Repository
```bash
- [ ] Run: git push origin main
- [ ] No errors
- [ ] Commit visible on GitHub/GitLab
```

## Phase 7: Vercel Deployment (5-10 minutes)

### Deploy Project
- [ ] Go to Vercel Dashboard
- [ ] Click **Add New** → **Project**
- [ ] Select ZimPharmHub repository
- [ ] Click **Import**

### Add Environment Variables
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add `DATABASE_URL=postgres://...`
- [ ] Add other variables (STRIPE_KEY, etc.)
- [ ] Save variables

### Trigger Deployment
- [ ] Click **Deploy** button
- [ ] Wait for build to complete
- [ ] See ✅ Production deployment successful

### Verify Deployment
- [ ] Go to deployment URL
- [ ] Test `/api/health` endpoint
- [ ] Should show "Vercel Postgres" as database
- [ ] Test other API endpoints
- [ ] All working properly

## Phase 8: Post-Deployment (5 minutes)

### Monitor Logs
- [ ] Check Vercel dashboard for errors
- [ ] Check database logs in Storage tab
- [ ] No connection errors

### Setup Monitoring (Optional)
- [ ] Enable deployment monitoring
- [ ] Set up error alerts
- [ ] Configure log retention

### Document Changes
- [ ] Update deployment documentation
- [ ] Document connection string location
- [ ] Share with team if needed

### Cleanup (Optional)
- [ ] Delete old Render Postgres database (if migrated)
- [ ] Archive old backup file
- [ ] Remove old documentation references

## Phase 9: Testing Checklist

### Core Functionality
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens valid
- [ ] Password reset works

### Job Listings
- [ ] Create job posting
- [ ] Search jobs
- [ ] Apply for job
- [ ] View applications

### Database Features
- [ ] Data persists across server restarts
- [ ] Queries execute properly
- [ ] No timeout errors
- [ ] Connection pooling working

### Error Handling
- [ ] Invalid credentials rejected
- [ ] Duplicate emails rejected
- [ ] Missing fields rejected
- [ ] Error messages clear

### Performance
- [ ] Pages load < 2 seconds
- [ ] API responses < 1 second
- [ ] Database queries efficient
- [ ] No N+1 query problems

## Phase 10: Documentation

### Update Documentation
- [ ] Update README.md with Vercel info
- [ ] Update deployment docs
- [ ] Update setup instructions
- [ ] Share migration guide with team

### Archive Old Docs
- [ ] Keep PostgreSQL setup docs for reference
- [ ] Note old connection method as "deprecated"
- [ ] Link to new Vercel docs

## Rollback Plan (If Needed)

- [ ] Keep git history intact
- [ ] Note previous working commit hash
- [ ] Know how to revert to Render if needed
- [ ] Have backup of old database

## Completion

- [ ] All phases completed
- [ ] All tests passing
- [ ] Deployment successful
- [ ] Team informed
- [ ] Documentation updated
- [ ] Ready for production use

## Post-Migration Tasks

### Within 1 Week
- [ ] Monitor performance metrics
- [ ] Check error logs regularly
- [ ] Gather team feedback
- [ ] Address any issues

### Within 1 Month
- [ ] Optimize database queries if needed
- [ ] Set up advanced monitoring
- [ ] Configure auto-scaling if needed
- [ ] Plan for future improvements

### Ongoing
- [ ] Regular backups
- [ ] Monitor costs
- [ ] Update dependencies
- [ ] Security audits

## Support Resources

If you get stuck:
1. **Quick Start**: VERCEL_POSTGRES_QUICK_START.md
2. **Full Guide**: VERCEL_POSTGRES_MIGRATION.md
3. **Deployment**: VERCEL_DEPLOYMENT_GUIDE.md
4. **Issues**: TROUBLESHOOTING.md
5. **Summary**: DATABASE_MIGRATION_SUMMARY.md

## Notes

```
[Your notes here - document any issues or special configurations]

```

---

**Last Updated**: January 9, 2025
**Migration Type**: Render PostgreSQL → Vercel Postgres
**Project**: ZimPharmHub
