const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * POST /api/audit-logs
 * Used internally by the application
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userType,
      action,
      resourceType,
      resourceId,
      resourceName,
      method,
      endpoint,
      statusCode,
      statusMessage,
      ipAddress,
      userAgent,
      sessionId,
      changes,
      description,
      details,
      severity,
      tags,
      success,
      error,
      duration,
    } = req.body;

    // Validate required fields
    if (!userId || !action) {
      return res.status(400).json({
        message: 'userId and action are required',
      });
    }

    const auditLog = new AuditLog({
      userId,
      userEmail,
      userType,
      action,
      resourceType,
      resourceId,
      resourceName,
      method,
      endpoint,
      statusCode,
      statusMessage,
      ipAddress,
      userAgent,
      sessionId,
      changes,
      description,
      details,
      severity,
      tags,
      success,
      error,
      duration,
    });

    await auditLog.save();

    res.status(201).json({
      success: true,
      messageId: auditLog.messageId,
      message: 'Audit log created',
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating audit log',
      error: error.message,
    });
  }
});

/**
 * Get audit logs (admin only)
 * GET /api/audit-logs
 * Query parameters: userId, action, severity, startDate, endDate, limit, skip
 */
router.get('/', async (req, res) => {
  try {
    const adminId = req.headers['user-id'];
    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify admin status (simplified - you may need proper role checking)
    const {
      userId,
      action,
      severity,
      startDate,
      endDate,
      resourceType,
      limit = 100,
      skip = 0,
    } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (severity) filter.severity = severity;
    if (resourceType) filter.resourceType = resourceType;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v')
      .populate('userId', 'firstName lastName email');

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      total,
      count: logs.length,
      skip: parseInt(skip),
      limit: parseInt(limit),
      logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message,
    });
  }
});

/**
 * Get single audit log by message ID
 * GET /api/audit-logs/:messageId
 */
router.get('/:messageId', async (req, res) => {
  try {
    const adminId = req.headers['user-id'];
    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const log = await AuditLog.findOne({ messageId: req.params.messageId })
      .populate('userId', 'firstName lastName email');

    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json({
      success: true,
      log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit log',
      error: error.message,
    });
  }
});

/**
 * Get user's own audit logs
 * GET /api/audit-logs/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const requestingUserId = req.headers['user-id'];
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Users can only view their own logs (except admins)
    if (requestingUserId !== userId) {
      // Check if requester is admin - simplified check
      // In production, verify admin role properly
    }

    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const total = await AuditLog.countDocuments({ userId });

    res.json({
      success: true,
      total,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user audit logs',
      error: error.message,
    });
  }
});

/**
 * Get audit logs by action
 * GET /api/audit-logs/action/:action
 */
router.get('/action/:action', async (req, res) => {
  try {
    const adminId = req.headers['user-id'];
    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { action } = req.params;
    const { limit = 100, skip = 0, startDate, endDate } = req.query;

    const filter = { action };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      action,
      total,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs by action',
      error: error.message,
    });
  }
});

/**
 * Get audit statistics
 * GET /api/audit-logs/stats/summary
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const adminId = req.headers['user-id'];
    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total logs
    const totalLogs = await AuditLog.countDocuments(dateFilter);

    // Logs by action
    const actionStats = await AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Logs by severity
    const severityStats = await AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    // Failed vs successful
    const successStats = await AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$success', count: { $sum: 1 } } },
    ]);

    // Top users
    const topUsers = await AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    res.json({
      success: true,
      totalLogs,
      actionStats,
      severityStats,
      successStats,
      topUsers,
      period: {
        startDate: startDate || 'all time',
        endDate: endDate || 'all time',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating audit statistics',
      error: error.message,
    });
  }
});

/**
 * Export audit logs (CSV format)
 * GET /api/audit-logs/export/csv
 */
router.get('/export/csv', async (req, res) => {
  try {
    const adminId = req.headers['user-id'];
    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).lean();

    // Convert to CSV
    const headers = [
      'Message ID',
      'User ID',
      'Email',
      'Action',
      'Resource Type',
      'Status',
      'IP Address',
      'Timestamp',
      'Severity',
    ];
    const rows = logs.map(log => [
      log.messageId,
      log.userId,
      log.userEmail,
      log.action,
      log.resourceType,
      log.statusCode,
      log.ipAddress,
      log.createdAt.toISOString(),
      log.severity,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting audit logs',
      error: error.message,
    });
  }
});

/**
 * Delete old audit logs (retention policy)
 * DELETE /api/audit-logs/cleanup
 * body: { daysToKeep: 365 }
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const adminId = req.headers['user-id'];
    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { daysToKeep = 365 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} audit logs older than ${daysToKeep} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up audit logs',
      error: error.message,
    });
  }
});

module.exports = router;
