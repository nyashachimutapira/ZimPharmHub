const express = require('express');
const User = require('../models-sequelize/User');
const router = express.Router();

// Get user profile (Sequelize)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user profile (Sequelize)
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const [count, rows] = await User.update(updates, { where: { id: req.params.id }, returning: true });
    if (!count) return res.status(404).json({ message: 'User not found' });
    const user = rows[0];
    delete user.dataValues.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Save job for later (disabled until migration)
router.post('/:id/save-job/:jobId', async (req, res) => {
  res.status(501).json({ message: 'Save job feature disabled until migration to PostgreSQL.' });
});

// Get saved jobs (disabled until migration)
router.get('/:id/saved-jobs', async (req, res) => {
  res.status(501).json({ message: 'Saved jobs are disabled until migration to PostgreSQL.' });
});

// Get user dashboard data (disabled until migration)
router.get('/:id/dashboard', async (req, res) => {
  res.status(501).json({ message: 'Dashboard is disabled until migration to PostgreSQL.' });
});

module.exports = router;
