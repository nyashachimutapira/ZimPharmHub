# Environment Variables Setup - Vercel Postgres

## Quick Setup

Create a `.env` file in the root directory (`ZimPharmHub/.env`) with the following content:

```env
# ============================================
# Vercel Postgres Database Configuration
# ============================================
DATABASE_URL=postgres://your-user:your-password@your-vercel-host/your-database

# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your-secure-random-key-change-this-in-production-minimum-32-characters-long

# ============================================
# Stripe Payment Configuration (Optional)
# ============================================
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
# STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
# FEATURE_PRICE_PER_DAY_USD=5

# ============================================
# Email Configuration (Optional)
# ============================================
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-specific-password
# EMAIL_FROM=noreply@zimpharmhub.com

# ============================================
# Frontend URL
# ============================================
FRONTEND_URL=http://localhost:3000
```

## Getting Your Vercel Postgres Connection String

### Step 1: Create Vercel Postgres Database
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab → **Create Database** → Select **Postgres**
4. Follow the setup wizard

### Step 2: Get Connection String
After database creation:
1. In Vercel Dashboard, go to **Storage** → Your Postgres Database
2. Click on the database name
3. Go to **.env.local** tab
4. Copy `POSTGRES_URL_NON_POOLING` (recommended for compatibility)

Your connection string will look like:
```
postgres://username:password@host.databases.vercel.sh:5432/verceldb
```

## Creating the .env File

### Windows (PowerShell):
```powershell
cd ZimPharmHub
@"
DATABASE_URL=postgres://your-user:your-password@your-vercel-host/your-database
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secure-random-key-change-this-in-production-minimum-32-characters-long
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
```

### Mac/Linux:
```bash
cat > .env << 'EOF'
DATABASE_URL=postgres://your-user:your-password@your-vercel-host/your-database
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secure-random-key-change-this-in-production-minimum-32-characters-long
FRONTEND_URL=http://localhost:3000
EOF
```

## Verify Your Configuration

Test your database connection:
```bash
node -e "require('dotenv').config(); const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ Vercel Postgres connected successfully!')).catch(e => console.log('❌ Connection error:', e.message));"
```

## Important Notes

1. **Never commit .env to git** - It's already in `.gitignore`
2. **DATABASE_URL is required** - The application ONLY uses this variable now
3. **Generate secure JWT_SECRET** - Run this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. **Remove old variables** - These are NO LONGER USED:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`
   - `DB_DIALECT`

## For Different Environments

### Development:
```env
NODE_ENV=development
DATABASE_URL=postgres://user:pass@host/your_database
```

### Production (Vercel):
```env
NODE_ENV=production
DATABASE_URL=postgres://user:pass@your-vercel-host/production_database
```

### Testing:
```env
NODE_ENV=test
DATABASE_URL=postgres://user:pass@host/test_database
```

## Migration from Render

If you previously used Render Postgres:

1. **Update DATABASE_URL** with your new Vercel Postgres connection string
2. **Remove** all the old Render-related variables (`DB_HOST`, `DB_USER`, etc.)
3. See `VERCEL_POSTGRES_MIGRATION.md` for detailed migration steps

## Deploying to Vercel

1. Push your code to GitHub/GitLab
2. Go to Vercel Dashboard → Your Project
3. Go to **Settings** → **Environment Variables**
4. Add `DATABASE_URL` with your production Vercel Postgres connection string
5. Deploy with `git push`

## Troubleshooting

### "ERROR: Cannot find module 'dotenv'"
```bash
npm install
npm run server
```

### "DATABASE_URL is not defined"
- Ensure `.env` file exists in the root directory
- Make sure the file is properly formatted
- Restart the server after creating/updating `.env`

### Connection Timeout
- Check `DATABASE_URL` format is correct
- Verify Vercel Postgres is not in "Sleep" state
- Check network connectivity

For detailed troubleshooting, see `VERCEL_POSTGRES_MIGRATION.md`.
