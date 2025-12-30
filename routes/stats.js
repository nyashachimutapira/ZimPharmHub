const express = require('express');
const router = express.Router();

const Job = require('../models/Job');
const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');
const Event = require('../models/Event');
const Product = require('../models/Product');
const Article = require('../models/Article');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const [jobs, pharmacies, users, events, products, articles] = await Promise.all([
      Job.countDocuments({ status: 'active' }),
      Pharmacy.countDocuments({}),
      User.countDocuments({}),
      Event.countDocuments({}),
      Product.countDocuments({}),
      Article.countDocuments({}),
    ]);

    res.json({
      jobs,
      pharmacies,
      members: users,
      events,
      products,
      articles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
