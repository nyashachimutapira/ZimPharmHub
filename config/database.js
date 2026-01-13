const { Sequelize } = require('sequelize');
require('dotenv').config();

// Only initialize Sequelize if not using MongoDB
let sequelize = null;

// Check if USE_MONGODB is explicitly set to 'true' (as string)
const useMongoDB = process.env.USE_MONGODB === 'true';

if (!useMongoDB && process.env.DATABASE_URL) {
  try {
    console.log('🔧 Initializing Sequelize with DATABASE_URL...');
    
    // Determine dialect from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    let dialect = 'postgres';
    
    if (dbUrl.startsWith('sqlite')) {
      dialect = 'sqlite';
    } else if (dbUrl.startsWith('mysql')) {
      dialect = 'mysql';
    }
    
    // SQLite connection
    if (dialect === 'sqlite') {
      sequelize = new Sequelize(dbUrl, {
        dialect: 'sqlite',
        logging: process.env.NODE_ENV === 'development' ? false : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
    } else {
      // Postgres/MySQL connection
      sequelize = new Sequelize(dbUrl, {
        dialect: dialect,
        protocol: dialect,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
    }
    
    console.log('✅ Sequelize initialized');
  } catch (err) {
    console.error('❌ Sequelize initialization error:', err.message);
    sequelize = null;
  }
} else if (useMongoDB) {
  console.log('ℹ️ MongoDB mode enabled - Sequelize disabled');
} else {
  console.log('⚠️ No database configured - set DATABASE_URL and USE_MONGODB');
}

module.exports = sequelize;

