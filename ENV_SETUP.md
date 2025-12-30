# Environment Variables Setup - PostgreSQL

## Quick Setup

Create a `.env` file in the root directory (`ZimPharmHub/.env`) with the following content:

```env
# ============================================
# PostgreSQL Database Configuration
# ============================================
DB_HOST=dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=zimphamhub
DB_USER=zimpham_user
DB_PASSWORD=giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF
DB_DIALECT=postgres
DATABASE_URLpostgresql://zimphamhub_user:giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF@dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com/zimphamhub

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
# Frontend URL
# ============================================
FRONTEND_URL=http://localhost:3000
```

## Creating the .env File

### Windows (PowerShell):
```powershell
cd ZimPharmHub
@"
DB_HOST=dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=zimphamhub
DB_USER=zimpham_user
DB_PASSWORD=giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF
DB_DIALECT=postgres
DATABASE_URL=postgresql://zimphamhub_user:giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF@dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com/zimphamhub
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secure-random-key-change-this-in-production-minimum-32-characters-long
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
```

### Mac/Linux:
```bash
cat > .env << 'EOF'
DB_HOST=dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=zimphamhub
DB_USER=zimpham_user
DB_PASSWORD=giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF
DB_DIALECT=postgres
DATABASE_URL=postgresql://zimphamhub_user:giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF@dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com/zimphamhub
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secure-random-key-change-this-in-production-minimum-32-characters-long
FRONTEND_URL=http://localhost:3000
EOF
```

Or manually create the file and copy the content above.

## Complete .env Template (with all options)

```env
# ============================================
# PostgreSQL Database Configuration
# ============================================
DB_HOST=dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=zimphamhub
DB_USER=zimpham_user
DB_PASSWORD=giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF
DB_DIALECT=postgres
DATABASE_URL=postgresql://zimphamhub_user:giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF@dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com/zimphamhub

# Alternative: Use connection string (for production/cloud)
# DATABASE_URL=postgresql://zimpharmuser:password123@localhost:5432/zimpharmhub

# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# JWT Authentication
# ============================================
# Generate a secure random string for production:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secure-random-key-change-this-in-production-minimum-32-characters-long

# ============================================
# Stripe Payment Configuration (Optional)
# ============================================
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
# STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
# FEATURE_PRICE_PER_DAY_USD=5  # default price per day in USD for featuring a job (optional)

# ============================================
# Email Configuration (Optional - for sending emails)
# ============================================
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-specific-password
# EMAIL_FROM=noreply@zimpharmhub.com

# ============================================
# File Upload Configuration (Optional)
# ============================================
# UPLOAD_MAX_SIZE=5242880
# UPLOAD_PATH=./uploads

# ============================================
# Frontend URL (for CORS and redirects)
# ============================================
FRONTEND_URL=http://localhost:3000

# ============================================
# MongoDB (REMOVE THIS - Not needed for PostgreSQL)
# ============================================
# MONGODB_URI=mongodb://localhost:27017/zimpharmhub
```

## Updating Existing .env File

If you already have a `.env` file with MongoDB configuration, update it:

**Remove/Replace:**
```env
DATABASE_URL=postgresql://zimphamhub_user:giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF@dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com/zimphamhub
```

**Add:**
```env
DB_HOST=dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=zimphamhub
DB_USER=zimpham_user
DB_PASSWORD=giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF
DB_DIALECT=postgres
DATABASE_URL=postgresql://zimphamhub_user:giG8XJ36wM6xYfOAmZJPtvbDyF6omGEF@dpg-d5991uu3jp1c73btvgu0-a.oregon-postgres.render.com/zimphamhub
```

## Verify Your Configuration

Test your database connection:
```bash
node -e "require('dotenv').config(); const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ PostgreSQL connected successfully!')).catch(e => console.log('❌ Connection error:', e.message));"
```

## Important Notes

1. **Never commit .env to git** - It's already in `.gitignore`
2. **Change default passwords** - Update `DB_PASSWORD` and `JWT_SECRET` in production
3. **Generate secure JWT_SECRET** - Run this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. **Update credentials** - Match `DB_USER` and `DB_PASSWORD` with your PostgreSQL setup

## For Different Environments

### Development:
```env
NODE_ENV=development
DB_NAME=zimpharmhub_dev
```

### Production:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/zimpharmhub_prod
# Enable SSL for production
```

### Testing:
```env
NODE_ENV=test
DB_NAME=zimpharmhub_test
```

