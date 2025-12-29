const express = require('express');
const Pharmacy = require('../models/Pharmacy');
const router = express.Router();

// Get all pharmacies
router.get('/', async (req, res) => {
  try {
    const { city, search, verified } = req.query;
    let filter = {};

    if (city) filter.city = city;
    if (verified) filter.isVerified = verified === 'true';
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }];
    }

    const pharmacies = await Pharmacy.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ ratings: -1 })
      .limit(50);

    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacies', error: error.message });
  }
});

// Get pharmacy by ID
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate('user', 'email phone');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacy', error: error.message });
  }
});

// Create pharmacy profile
router.post('/', async (req, res) => {
  try {
    const { name, registrationNumber, phone, email, address, city, province, services, description } = req.body;
    const userId = req.headers['user-id'];

    const pharmacy = new Pharmacy({
      user: userId,
      name,
      registrationNumber,
      phone,
      email,
      address,
      city,
      province,
      services,
      description,
    });

    await pharmacy.save();
    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Error creating pharmacy profile', error: error.message });
  }
});

// Update pharmacy
router.put('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pharmacy', error: error.message });
  }
});

module.exports = router;
