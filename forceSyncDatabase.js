require('dotenv').config();
const sequelize = require('./config/database');

// Only import the most critical models
const User = require('./models-sequelize/User');
const Job = require('./models-sequelize/Job');
const JobApplication = require('./models-sequelize/JobApplication');

async function syncDatabase() {
  try {
    console.log('🔄 Starting database sync...');
    
    // Test connection first
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Force sync all models with alter
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized');
    
    console.log('\n📊 Tables created/updated:');
    const tables = await sequelize.queryInterface.showAllTables();
    tables.forEach(table => console.log(`   - ${table}`));
    
    console.log('\n✨ Database sync complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

syncDatabase();
