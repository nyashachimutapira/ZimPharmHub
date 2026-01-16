const express = require('express');
const router = express.Router();
const SalaryReport = require('../models/SalaryReport');
const JobMarketAnalytics = require('../models/JobMarketAnalytics');
const ShortageArea = require('../models/ShortageArea');
const { Op } = require('sequelize');

// Get salary reports
router.get('/salary', async (req, res) => {
  try {
    const { location, city, province, position, experience, limit = 20, offset = 0 } = req.query;
    const where = {};

    if (location) where.location = location;
    if (city) where.city = city;
    if (province) where.province = province;
    if (position) where.position = position;
    if (experience) where.experience = experience;

    const reports = await SalaryReport.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['reportMonth', 'DESC']],
    });

    res.json({
      total: reports.count,
      data: reports.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest salary report for a position
router.get('/salary/latest/:position', async (req, res) => {
  try {
    const report = await SalaryReport.findOne({
      where: { position: req.params.position },
      order: [['reportMonth', 'DESC']],
    });

    if (!report) {
      return res.status(404).json({ message: 'No salary data found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get salary trends by city
router.get('/salary/trends/:city', async (req, res) => {
  try {
    const trends = await SalaryReport.findAll({
      where: { city: req.params.city },
      order: [['reportMonth', 'ASC']],
      limit: 12, // Last 12 months
    });

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get job market analytics
router.get('/market', async (req, res) => {
  try {
    const latestAnalytics = await JobMarketAnalytics.findOne({
      order: [['reportMonth', 'DESC']],
    });

    if (!latestAnalytics) {
      return res.status(404).json({ message: 'No market data available' });
    }

    res.json(latestAnalytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get market trends
router.get('/market/trends', async (req, res) => {
  try {
    const analytics = await JobMarketAnalytics.findAll({
      order: [['reportMonth', 'DESC']],
      limit: 12,
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top skills in demand
router.get('/market/skills', async (req, res) => {
  try {
    const latest = await JobMarketAnalytics.findOne({
      order: [['reportMonth', 'DESC']],
    });

    if (!latest) {
      return res.status(404).json({ message: 'No data available' });
    }

    res.json(latest.topSkillsInDemand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pharmacy shortage areas
router.get('/shortages', async (req, res) => {
  try {
    const { province, shortageLevel, limit = 20, offset = 0 } = req.query;
    const where = {};

    if (province) where.province = province;
    if (shortageLevel) where.shortageLevel = shortageLevel;

    const areas = await ShortageArea.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['shortageLevel', 'DESC'], ['opportunityScore', 'DESC']],
    });

    res.json({
      total: areas.count,
      data: areas.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get critical shortage areas
router.get('/shortages/critical', async (req, res) => {
  try {
    const areas = await ShortageArea.findAll({
      where: { shortageLevel: 'critical' },
      order: [['opportunityScore', 'DESC']],
    });

    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get shortage by province
router.get('/shortages/province/:province', async (req, res) => {
  try {
    const areas = await ShortageArea.findAll({
      where: { province: req.params.province },
      order: [['shortageLevel', 'DESC']],
    });

    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get opportunities map (shortage areas with high opportunity scores)
router.get('/opportunities/map', async (req, res) => {
  try {
    const areas = await ShortageArea.findAll({
      where: {
        opportunityScore: { [Op.gte]: 7 },
      },
      order: [['opportunityScore', 'DESC']],
    });

    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
