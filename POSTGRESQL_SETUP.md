# Quick PostgreSQL Setup Guide

## 1. Install PostgreSQL

### Windows:
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run installer
3. Remember the postgres user password you set

### Mac:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. Create Database and User

Open PostgreSQL command line (psql) or pgAdmin:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE zimpharmhub;

-- Create user (or use existing postgres user)
CREATE USER zimpharmuser WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;

-- Connect to the database
\c zimpharmhub

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO zimpharmuser;
```

## 3. Install Node.js Dependencies

```bash
npm install sequelize pg pg-hstore
npm install --save-dev sequelize-cli
```

## 4. Update package.json

Add to dependencies:
```json
{
  "dependencies": {
    "sequelize": "^6.35.0",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4"
  }
}
```

## 5. Update .env File

```env
# Remove MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/zimpharmhub

# Add PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zimpharmhub
DB_USER=zimpharmuser
DB_PASSWORD=your_secure_password
DB_DIALECT=postgres

# Or use connection string
# DATABASE_URL=postgresql://zimpharmuser:your_secure_password@localhost:5432/zimpharmhub
```

## 6. Initialize Sequelize

```bash
npx sequelize-cli init
```

This creates:
- `config/config.json`
- `models/index.js`
- `migrations/` folder
- `seeders/` folder

## 7. Update config/config.json

```json
{
  "development": {
    "username": "zimpharmuser",
    "password": "your_secure_password",
    "database": "zimpharmhub",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },
  "test": {
    "username": "zimpharmuser",
    "password": "your_secure_password",
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

## 8. Update server.js

Replace MongoDB connection with Sequelize:

```javascript
// Remove this:
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, ...)

// Add this:
const sequelize = require('./config/database');

sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Sync models (development only)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
  });
}
```

## 9. Convert All Models

You'll need to:
1. Convert all Mongoose models to Sequelize models
2. Create migrations for all tables
3. Handle relationships differently (associations instead of refs)
4. Convert embedded arrays to separate tables

**Example conversion is in `models-sequelize/` folder**

## 10. Update All Routes

Replace all Mongoose queries with Sequelize queries:

```javascript
// Before (MongoDB/Mongoose):
const users = await User.find({ userType: 'job_seeker' });
const user = await User.findById(id);

// After (PostgreSQL/Sequelize):
const users = await User.findAll({ 
  where: { userType: 'job_seeker' } 
});
const user = await User.findByPk(id);
```

## 11. Common Query Conversions

| MongoDB | Sequelize |
|---------|-----------|
| `Model.find()` | `Model.findAll()` |
| `Model.findById(id)` | `Model.findByPk(id)` |
| `Model.findOne({ email })` | `Model.findOne({ where: { email } })` |
| `.populate('user')` | `include: [{ model: User }]` |
| `Model.create(data)` | `Model.create(data)` (same) |
| `Model.findByIdAndUpdate(id, data)` | `Model.update(data, { where: { id } })` |
| `Model.findByIdAndDelete(id)` | `Model.destroy({ where: { id } })` |

## Next Steps

1. Follow the full migration guide in `POSTGRESQL_MIGRATION.md`
2. Convert all models (see `models-sequelize/` for examples)
3. Create migrations for all tables
4. Update all route files
5. Test thoroughly

## Testing Connection

```bash
node -e "const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e));"
```

## Helpful Resources

- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Node-postgres (pg)](https://node-postgres.com/)

