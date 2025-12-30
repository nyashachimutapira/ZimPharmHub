const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const Pharmacy = require('../models/Pharmacy');

// Get all active ads (optionally filter by pharmacy)
router.get('/', async (req, res) => {
  try {
    const { pharmacyId, type, featured } = req.query;
    const filter = { isActive: true };
    if (pharmacyId) filter.pharmacy = pharmacyId;
    if (type) filter.type = type;
    if (featured !== undefined) filter.featured = featured === 'true';

    const ads = await Advertisement.find(filter).populate('pharmacy', 'name city');
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error: error.message });
  }
});

// Create ad (pharmacy owners)
router.post('/', async (req, res) => {
  try {
    const { title, body, images, link, type, featured, expiresAt } = req.body;
    const pharmacyId = req.headers['user-id'];

    if (!pharmacyId) return res.status(401).json({ message: 'Authentication required' });

    // Ensure pharmacy exists and belongs to user
    const pharmacy = await Pharmacy.findOne({ user: pharmacyId });
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy profile not found for this user' });

    const ad = new Advertisement({
      pharmacy: pharmacy._id,
      title,
      body,
      images: images || [],
      link,
      type: type || 'general',
      featured: !!featured,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ad', error: error.message });
  }
});

// Update ad (owner or admin)
router.put('/:id', async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ad', error: error.message });
  }
});

// Delete ad
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Advertisement.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Ad not found' });
    res.json({ message: 'Ad removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ad', error: error.message });
  }
});

module.exports = router;
