const express = require('express');
const cors = require('cors');
require('dotenv').config();

// MongoDB (Mongoose) connection used by legacy code
// Disabled by default — enable by setting USE_MONGODB=true and MONGODB_URI
let mongoose;
if (process.env.USE_MONGODB === 'true' && process.env.MONGODB_URI) {
  mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('✅ MongoDB connected (legacy)'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));
} else {
  console.log('ℹ️ MongoDB disabled. Set USE_MONGODB=true and MONGODB_URI to enable legacy Mongo features.');
}

// Vercel Postgres Database Connection
const sequelize = require('./config/database');

const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Export app for tests
module.exports = app;
// Serve uploaded files (resumes, images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Vercel Postgres connected successfully');
    
    // Sync models (alter: true only in development, disabled in production)
     if (process.env.NODE_ENV === 'development') {
      sequelize.sync({ 
        alter: process.env.NODE_ENV === 'development',
        force: false 
      })
        .then(() => {
          console.log('✅ Database models synchronized');
          // Start job scheduler in development/production - handles expirations and un-featuring
          try {
            const { startJobScheduler } = require('./utils/jobScheduler');
            startJobScheduler();
          } catch (err) {
            console.error('Failed to start job scheduler:', err.message);
          }
        })
        .catch(err => console.error('❌ Database sync error:', err));
    } else {
      // Always start scheduler in production too
      try {
        const { startJobScheduler } = require('./utils/jobScheduler');
        startJobScheduler();
      } catch (err) {
        console.error('Failed to start job scheduler:', err.message);
      }
    }
  })
  .catch(err => {
    console.error('❌ Vercel Postgres connection error:', err.message);
    console.log('⚠️  Server will continue but database features may not work');
    console.log('💡 Check your .env file for DATABASE_URL and verify Vercel Postgres is running');
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/products', require('./routes/products'));
app.use('/api/pharmacies', require('./routes/pharmacies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/events', require('./routes/events'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));

// Saved searches are disabled until migrated to PostgreSQL/Sequelize
// app.use('/api/saved-searches', require('./routes/savedSearches'));

// Saved jobs (bookmarks)
app.use('/api/saved-jobs', require('./routes/savedJobs'));

// Job alerts and notifications
app.use('/api/job-alerts', require('./routes/jobAlerts'));

// Advanced search and filters
app.use('/api', require('./routes/advancedSearch'));

app.use('/api/analytics', require('./routes/analytics'));

// Dashboard
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'ZimPharmHub API is running',
    database: 'Vercel Postgres',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}/api/health`);
    console.log(`📊 Frontend should be at http://localhost:3000`);
  });
} else {
  // When required as a module (e.g. in tests), don't start the server automatically
  console.log('ℹ️ Server app imported for testing. Listening is disabled.');
}
