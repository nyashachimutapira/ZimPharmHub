const express = require('express');
const router = express.Router();

// Notifications API disabled while migrating to PostgreSQL/Sequelize
router.use((req, res) => {
  res.status(501).json({ message: 'Notifications API is disabled. Pending migration to PostgreSQL.' });
});

module.exports = router;

