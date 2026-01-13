const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const CPDRecord = require('../models/CPDRecord');
const User = require('../models-sequelize/User');

// Get CPD records for current user
router.get('/my-records', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('verified').optional().isBoolean(),
  query('year').optional().isInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { page = 1, limit = 20, verified, year } = req.query;
    const offset = (page - 1) * limit;

    let where = { userId: req.user.id };
    if (verified !== undefined) where.verified = verified === 'true';
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      where.activityDate = {
        [require('sequelize').Op.between]: [startDate, endDate],
      };
    }

    const records = await CPDRecord.findAndCountAll({
      where,
      order: [['activityDate', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: records.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: records.count,
        pages: Math.ceil(records.count / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching CPD records:', err);
    return res.status(500).json({ error: 'Failed to fetch CPD records' });
  }
});

// Create CPD record
router.post('/', auth, [
  body('activityType').isIn([
    'workshop', 'seminar', 'conference', 'online_course',
    'publication', 'presentation', 'research', 'certification',
    'professional_meeting', 'mentoring'
  ]),
  body('title').trim().notEmpty(),
  body('hoursEarned').isDecimal({ decimal_digits: '0,2' }).custom(v => v > 0),
  body('activityDate').isISO8601(),
  body('category').optional().isIn(['mandatory', 'elective']),
  body('provider').optional().trim(),
  body('description').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      activityType, title, hoursEarned, activityDate,
      category = 'elective', provider, description, completionCertificate, evidence
    } = req.body;

    const record = await CPDRecord.create({
      userId: req.user.id,
      activityType,
      title,
      hoursEarned: parseFloat(hoursEarned),
      activityDate: new Date(activityDate),
      category,
      provider,
      description,
      completionCertificate,
      evidence,
    });

    return res.status(201).json({
      success: true,
      data: record,
      message: 'CPD record created and pending verification',
    });
  } catch (err) {
    console.error('Error creating CPD record:', err);
    return res.status(500).json({ error: 'Failed to create CPD record' });
  }
});

// Get CPD statistics for current user
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const records = await CPDRecord.findAll({
      where: {
        userId: req.user.id,
        verified: true,
        activityDate: {
          [require('sequelize').Op.between]: [startDate, endDate],
        },
      },
    });

    const totalHours = records.reduce((sum, r) => sum + parseFloat(r.hoursEarned), 0);
    const mandatoryHours = records
      .filter(r => r.category === 'mandatory')
      .reduce((sum, r) => sum + parseFloat(r.hoursEarned), 0);
    const electiveHours = records
      .filter(r => r.category === 'elective')
      .reduce((sum, r) => sum + parseFloat(r.hoursEarned), 0);

    const byType = {};
    records.forEach(r => {
      byType[r.activityType] = (byType[r.activityType] || 0) + parseFloat(r.hoursEarned);
    });

    return res.json({
      success: true,
      data: {
        year: parseInt(year),
        totalHours: parseFloat(totalHours.toFixed(2)),
        mandatoryHours: parseFloat(mandatoryHours.toFixed(2)),
        electiveHours: parseFloat(electiveHours.toFixed(2)),
        recordCount: records.length,
        byType,
        complianceStatus: totalHours >= 30 ? 'compliant' : 'non-compliant',
        hoursNeeded: Math.max(0, 30 - totalHours).toFixed(2),
      },
    });
  } catch (err) {
    console.error('Error fetching CPD statistics:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update CPD record
router.put('/:recordId', auth, [
  param('recordId').isUUID(),
  body('activityType').optional().isIn([
    'workshop', 'seminar', 'conference', 'online_course',
    'publication', 'presentation', 'research', 'certification',
    'professional_meeting', 'mentoring'
  ]),
  body('title').optional().trim().notEmpty(),
  body('hoursEarned').optional().isDecimal({ decimal_digits: '0,2' }).custom(v => v > 0),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { recordId } = req.params;
    const record = await CPDRecord.findByPk(recordId);

    if (!record) return res.status(404).json({ error: 'CPD record not found' });
    if (record.userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {};
    if (req.body.activityType) updateData.activityType = req.body.activityType;
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.hoursEarned) updateData.hoursEarned = parseFloat(req.body.hoursEarned);
    if (req.body.provider) updateData.provider = req.body.provider;
    if (req.body.description) updateData.description = req.body.description;

    if (Object.keys(updateData).length > 0) {
      updateData.verified = false; // Re-verify after update
      await record.update(updateData);
    }

    return res.json({
      success: true,
      data: record,
      message: 'CPD record updated and pending verification',
    });
  } catch (err) {
    console.error('Error updating CPD record:', err);
    return res.status(500).json({ error: 'Failed to update CPD record' });
  }
});

// Delete CPD record
router.delete('/:recordId', auth, [
  param('recordId').isUUID(),
], async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await CPDRecord.findByPk(recordId);

    if (!record) return res.status(404).json({ error: 'CPD record not found' });
    if (record.userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await record.destroy();
    return res.json({ success: true, message: 'CPD record deleted' });
  } catch (err) {
    console.error('Error deleting CPD record:', err);
    return res.status(500).json({ error: 'Failed to delete CPD record' });
  }
});

// Admin: Get pending CPD records for verification
router.get('/admin/pending', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const records = await CPDRecord.findAndCountAll({
      where: { verified: false },
      include: [
        {
          association: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: records.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: records.count,
        pages: Math.ceil(records.count / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching pending CPD records:', err);
    return res.status(500).json({ error: 'Failed to fetch pending records' });
  }
});

// Admin: Verify/reject CPD record
router.patch('/:recordId/verify', auth, [
  param('recordId').isUUID(),
  body('verified').isBoolean(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { recordId } = req.params;
    const { verified, notes } = req.body;

    const record = await CPDRecord.findByPk(recordId);
    if (!record) return res.status(404).json({ error: 'CPD record not found' });

    await record.update({
      verified,
      verifiedBy: req.user.id,
      verificationDate: new Date(),
      notes,
    });

    return res.json({
      success: true,
      data: record,
      message: `CPD record ${verified ? 'verified' : 'rejected'}`,
    });
  } catch (err) {
    console.error('Error verifying CPD record:', err);
    return res.status(500).json({ error: 'Failed to verify record' });
  }
});

module.exports = router;
