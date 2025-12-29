const express = require('express');
const cors = require('cors');
require('dotenv').config();

// PostgreSQL Database Connection
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Test Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully');
    
    // Sync models in development (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      sequelize.sync({ alter: false })
        .then(() => console.log('✅ Database models synchronized'))
        .catch(err => console.error('❌ Database sync error:', err));
    }
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.log('⚠️  Server will continue but database features may not work');
    console.log('💡 Check your .env file and make sure PostgreSQL is running');
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/products', require('./routes/products'));
app.use('/api/pharmacies', require('./routes/pharmacies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/events', require('./routes/events'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'ZimPharmHub API is running',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api/health`);
  console.log(`📊 Frontend should be at http://localhost:3000`);
});
