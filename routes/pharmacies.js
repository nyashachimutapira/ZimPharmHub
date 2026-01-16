const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Pharmacy model not yet fully migrated to Sequelize
const Pharmacy = require('../models-sequelize/Pharmacy');

// Get all pharmacies with search and filters
router.get('/', async (req, res) => {
  try {
    const { city, province, search, rating, limit = 20, offset = 0 } = req.query;
    const where = { isVerified: true };

    if (city) where.city = city;
    if (province) where.province = province;
    if (search) {
      where[Op.or] = [
        { pharmacyName: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (rating) {
      where.rating = { [Op.gte]: rating };
    }

    const pharmacies = await Pharmacy.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC']],
    });

    res.json({
      total: pharmacies.count,
      data: pharmacies.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pharmacy by ID
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new pharmacy (authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      pharmacyName,
      registrationNumber,
      description,
      address,
      city,
      province,
      postalCode,
      phoneNumber,
      email,
      website,
      latitude,
      longitude,
      services,
      operatingHours,
      logoUrl,
    } = req.body;

    const pharmacy = await Pharmacy.create({
      userId: req.user.id,
      pharmacyName,
      registrationNumber,
      description,
      address,
      city,
      province,
      postalCode,
      phoneNumber,
      email,
      website,
      latitude,
      longitude,
      services: services || [],
      operatingHours,
      logoUrl,
    });

    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update pharmacy
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(pharmacy, req.body);
    await pharmacy.save();

    res.json(pharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
