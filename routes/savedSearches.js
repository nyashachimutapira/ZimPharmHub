const express = require('express');
const router = express.Router();

// NOTE: Saved-searches were originally implemented with MongoDB (Mongoose).
// This endpoint is intentionally disabled until the feature is migrated to PostgreSQL/Sequelize.

router.use((req, res) => {
  res.status(501).json({ message: 'Saved searches are disabled. Feature pending migration to PostgreSQL.' });
});

module.exports = router;
