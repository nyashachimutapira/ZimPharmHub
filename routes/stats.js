const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Import available Sequelize models
const Job = require('../models-sequelize/Job');
const User = require('../models-sequelize/User');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    // Get stats from available models
    const [jobs, users] = await Promise.all([
      Job.count({ where: { status: 'active' } }).catch(() => 0),
      User.count().catch(() => 0),
    ]);

    // Try to get counts from other tables directly using Sequelize query
    let pharmacies = 0;
    let events = 0;
    let products = 0;
    let articles = 0;

    try {
      // Check if tables exist and get counts
      const [pharmacyResult] = await sequelize.query("SELECT COUNT(*) as count FROM pharmacies");
      pharmacies = parseInt(pharmacyResult[0]?.count || 0);

      const [eventResult] = await sequelize.query("SELECT COUNT(*) as count FROM events");
      events = parseInt(eventResult[0]?.count || 0);

      const [productResult] = await sequelize.query("SELECT COUNT(*) as count FROM products");
      products = parseInt(productResult[0]?.count || 0);

      const [articleResult] = await sequelize.query("SELECT COUNT(*) as count FROM articles");
      articles = parseInt(articleResult[0]?.count || 0);
    } catch (err) {
      // If tables don't exist, use 0 as default
      console.log('Some stats tables may not exist yet:', err.message);
    }

    res.json({
      jobs: jobs || 0,
      pharmacies: pharmacies || 0,
      members: users || 0,
      events: events || 0,
      products: products || 0,
      articles: articles || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error fetching stats', 
      error: error.message,
      // Return default values on error so frontend doesn't break
      jobs: 0,
      pharmacies: 0,
      members: 0,
      events: 0,
      products: 0,
      articles: 0,
    });
  }
});

module.exports = router;
