# PostgreSQL Migration Guide - ZimPharmHub

## Overview

This guide will help you migrate from MongoDB to PostgreSQL using Sequelize ORM.

## Prerequisites

1. **Install PostgreSQL:**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create PostgreSQL Database:**
   ```sql
   -- Open psql or pgAdmin
   CREATE DATABASE zimpharmhub;
   CREATE USER zimpharmuser WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;
   ```

## Step 1: Install Dependencies

```bash
npm install sequelize pg pg-hstore
npm install --save-dev sequelize-cli
```

Or update your `package.json`:

```json
{
  "dependencies": {
    "sequelize": "^6.35.0",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4"
  },
  "devDependencies": {
    "sequelize-cli": "^6.6.2"
  }
}
```

Then run: `npm install`

## Step 2: Install Sequelize CLI and Initialize

```bash
npx sequelize-cli init
```

This creates:
- `config/config.json` - Database configuration
- `models/index.js` - Sequelize instance
- `migrations/` - Migration files
- `seeders/` - Seed files

## Step 3: Configure Database Connection

Update `.env` file:
```env
# PostgreSQL Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zimpharmhub
DB_USER=zimpharmuser
DB_PASSWORD=your_password
DB_DIALECT=postgres

# Or use connection string
DATABASE_URL=postgresql://zimpharmuser:your_password@localhost:5432/zimpharmhub
```

Update `config/config.json`:
```json
{
  "development": {
    "username": "zimpharmuser",
    "password": "your_password",
    "database": "zimpharmhub",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },
  "test": {
    "username": "zimpharmuser",
    "password": "your_password",
    "database": "zimpharmhub_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

## Step 4: Create Database Connection File

Create `config/database.js`:
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'zimpharmhub',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
```

## Step 5: Key Differences Between MongoDB and PostgreSQL

### MongoDB → PostgreSQL Changes:

1. **ObjectId → UUID or Integer IDs**
   - Use `UUID` or `INTEGER` with `autoIncrement`

2. **Embedded Documents → Separate Tables**
   - `applicants` array → `JobApplications` table
   - `reviews` array → `ProductReviews` table
   - `comments` array → `ForumComments` table

3. **JSON Fields**
   - Use `JSONB` or `JSON` for complex objects
   - Or create separate tables with foreign keys

4. **Arrays**
   - Use `ARRAY` type or separate join tables

5. **References**
   - `mongoose.Schema.Types.ObjectId` → `UUID` or `INTEGER` foreign keys

## Step 6: Model Conversion Examples

### User Model (MongoDB → Sequelize)

**MongoDB:**
```javascript
const UserSchema = new mongoose.Schema({
  firstName: String,
  email: { type: String, unique: true },
  savedJobs: [mongoose.Schema.Types.ObjectId]
});
```

**Sequelize:**
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userType: {
    type: DataTypes.ENUM('job_seeker', 'pharmacy', 'admin'),
    allowNull: false
  },
  phone: DataTypes.STRING,
  profilePicture: DataTypes.STRING,
  bio: DataTypes.TEXT,
  location: DataTypes.STRING,
  certifications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  resume: DataTypes.STRING,
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('free', 'premium', 'enterprise'),
    defaultValue: 'free'
  },
  subscriptionEndDate: DataTypes.DATE
}, {
  timestamps: true,
  tableName: 'users'
});
```

## Step 7: Relationship Changes

### Many-to-Many: Users and Saved Jobs

**MongoDB:** Array of IDs in User document
**Sequelize:** Junction table

```javascript
// Create SavedJobs junction table
const SavedJobs = sequelize.define('SavedJobs', {
  userId: {
    type: DataTypes.UUID,
    references: { model: 'Users', key: 'id' }
  },
  jobId: {
    type: DataTypes.UUID,
    references: { model: 'Jobs', key: 'id' }
  }
});

// Define relationships
User.belongsToMany(Job, { through: SavedJobs, as: 'savedJobs' });
Job.belongsToMany(User, { through: SavedJobs, as: 'savedByUsers' });
```

### One-to-Many: Pharmacy and Jobs

```javascript
Pharmacy.hasMany(Job, { foreignKey: 'pharmacyId', as: 'jobs' });
Job.belongsTo(Pharmacy, { foreignKey: 'pharmacyId', as: 'pharmacy' });
```

## Step 8: Query Changes

### MongoDB Queries → Sequelize

**MongoDB:**
```javascript
const users = await User.find({ userType: 'job_seeker' });
const job = await Job.findById(id).populate('pharmacy');
```

**Sequelize:**
```javascript
const users = await User.findAll({ 
  where: { userType: 'job_seeker' } 
});
const job = await Job.findByPk(id, {
  include: [{ model: Pharmacy, as: 'pharmacy' }]
});
```

## Step 9: Update server.js

```javascript
const sequelize = require('./config/database');

// Test connection
sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Sync models (for development only)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true });
}
```

## Step 10: Run Migrations

```bash
# Create migration
npx sequelize-cli migration:generate --name create-users-table

# Run migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

## Step 11: Update All Routes

Replace all Mongoose queries with Sequelize:

**Before (MongoDB):**
```javascript
const jobs = await Job.find({ status: 'active' })
  .populate('pharmacy');
```

**After (PostgreSQL):**
```javascript
const jobs = await Job.findAll({
  where: { status: 'active' },
  include: [{ model: User, as: 'pharmacy' }]
});
```

## Step 12: Update Seed Script

Convert `seedDatabase.js` to use Sequelize instead of Mongoose.

## Common Issues and Solutions

### Issue 1: Arrays in PostgreSQL
**Solution:** Use `ARRAY` type or separate tables
```javascript
certifications: DataTypes.ARRAY(DataTypes.STRING)
```

### Issue 2: Embedded Documents
**Solution:** Create separate models and use associations
```javascript
// Instead of embedded applicants array
// Create JobApplication model
const JobApplication = sequelize.define('JobApplication', {
  userId: DataTypes.UUID,
  jobId: DataTypes.UUID,
  status: DataTypes.ENUM(...),
  appliedAt: DataTypes.DATE
});
```

### Issue 3: ObjectId References
**Solution:** Use UUID or INTEGER
```javascript
id: {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true
}
```

## Migration Checklist

- [ ] Install PostgreSQL
- [ ] Create database and user
- [ ] Install Sequelize dependencies
- [ ] Initialize Sequelize CLI
- [ ] Configure database connection
- [ ] Convert all models to Sequelize
- [ ] Create migrations
- [ ] Update all routes/queries
- [ ] Update seed script
- [ ] Test all endpoints
- [ ] Update environment variables

## Useful Sequelize Commands

```bash
# Create model
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string

# Create migration
npx sequelize-cli migration:generate --name add-email-to-users

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Check migration status
npx sequelize-cli db:migrate:status

# Create seeder
npx sequelize-cli seed:generate --name demo-user

# Run seeders
npx sequelize-cli db:seed:all
```

## Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize CLI](https://github.com/sequelize/cli)

