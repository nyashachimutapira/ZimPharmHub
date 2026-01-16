const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Certification = require('../models/Certification');

// Get all certifications for a user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const certifications = await Certification.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending certifications for verification (admin only)
router.get('/admin/pending', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const certifications = await Certification.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'ASC']],
    });
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new certification
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      certificationName,
      issuingBody,
      licenseNumber,
      issueDate,
      expiryDate,
      documentUrl,
    } = req.body;

    const certification = await Certification.create({
      userId: req.user.id,
      certificationName,
      issuingBody,
      licenseNumber,
      issueDate,
      expiryDate,
      documentUrl,
    });

    res.status(201).json(certification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify certification (admin only)
router.put('/:id/verify', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const certification = await Certification.findByPk(req.params.id);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    certification.status = 'verified';
    certification.verifiedBy = req.user.id;
    certification.verifiedAt = new Date();
    await certification.save();

    res.json(certification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject certification (admin only)
router.put('/:id/reject', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const certification = await Certification.findByPk(req.params.id);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    certification.status = 'rejected';
    certification.rejectionReason = rejectionReason;
    certification.verifiedBy = req.user.id;
    certification.verifiedAt = new Date();
    await certification.save();

    res.json(certification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
