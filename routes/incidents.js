const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const IncidentReport = require('../models/IncidentReport');
const { Op } = require('sequelize');

// Get user's incident reports
router.get('/my', authenticate, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const where = { reporterId: req.user.id };

    if (status) where.status = status;

    const reports = await IncidentReport.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      total: reports.count,
      data: reports.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reports (admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status, category, severity, limit = 20, offset = 0 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (severity) where.severity = severity;

    const reports = await IncidentReport.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['severity', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      total: reports.count,
      data: reports.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit incident report
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      incidentDate,
      location,
      severity,
      isAnonymous,
      evidence,
      witnesses,
    } = req.body;

    const reportNumber = `INC-${Date.now()}`;

    const report = await IncidentReport.create({
      reporterId: req.user.id,
      reportNumber,
      title,
      description,
      category,
      incidentDate,
      location,
      severity,
      isAnonymous: isAnonymous !== false,
      evidence,
      witnesses,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get incident detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const report = await IncidentReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only reporter or admin can view
    if (report.reporterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update report status (admin only)
router.put('/:id/status', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await IncidentReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;
    if (status === 'resolved' || status === 'closed') {
      report.resolvedAt = new Date();
    }
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
