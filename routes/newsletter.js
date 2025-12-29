const express = require('express');
const Newsletter = require('../models/Newsletter');
const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, firstName, lastName, categories } = req.body;

    let subscription = await Newsletter.findOne({ email });
    if (subscription) {
      subscription.isActive = true;
      subscription.categories = categories || subscription.categories;
      await subscription.save();
      return res.json({ message: 'Subscription updated', subscription });
    }

    subscription = new Newsletter({
      email,
      firstName,
      lastName,
      categories: categories || { jobs: true, products: true, news: true, events: true },
    });

    await subscription.save();
    res.status(201).json({ message: 'Subscribed to newsletter', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing to newsletter', error: error.message });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const subscription = await Newsletter.findOneAndUpdate({ email }, { isActive: false }, { new: true });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Unsubscribed from newsletter', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error unsubscribing', error: error.message });
  }
});

// Get all subscriptions (admin)
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Newsletter.find({ isActive: true }).limit(100);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
});

module.exports = router;
