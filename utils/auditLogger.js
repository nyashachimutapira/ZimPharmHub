const AuditLog = require('../models/AuditLog');

/**
 * Audit Logger utility
 * Provides methods to log user actions for compliance and security
 */

class AuditLogger {
  /**
   * Log an action
   * @param {object} logData - Log data
   * @returns {Promise<AuditLog>} Created audit log
   */
  static async log(logData) {
    try {
      const {
        userId,
        userEmail,
        userType,
        action, // required
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
        severity = 'low',
        tags = [],
        success = true,
        error = null,
        duration = 0,
      } = logData;

      // Validate required fields
      if (!userId || !action) {
        throw new Error('userId and action are required');
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
      return auditLog;
    } catch (err) {
      console.error('Error logging audit:', err);
      // Don't throw - audit failures shouldn't break the app
      return null;
    }
  }

  /**
   * Log login action
   */
  static async logLogin(userId, userEmail, userType, ipAddress, userAgent, success = true) {
    return this.log({
      userId,
      userEmail,
      userType,
      action: 'login',
      method: 'POST',
      endpoint: '/api/auth/login',
      ipAddress,
      userAgent,
      statusCode: success ? 200 : 401,
      success,
      severity: success ? 'low' : 'medium',
      tags: ['security', 'authentication'],
    });
  }

  /**
   * Log logout action
   */
  static async logLogout(userId, userEmail, userType, ipAddress, userAgent) {
    return this.log({
      userId,
      userEmail,
      userType,
      action: 'logout',
      method: 'POST',
      endpoint: '/api/auth/logout',
      ipAddress,
      userAgent,
      statusCode: 200,
      tags: ['security', 'authentication'],
    });
  }

  /**
   * Log job application
   */
  static async logJobApplication(userId, userEmail, jobId, jobTitle, ipAddress, userAgent) {
    return this.log({
      userId,
      userEmail,
      action: 'job_apply',
      resourceType: 'application',
      resourceId: jobId,
      resourceName: jobTitle,
      method: 'POST',
      endpoint: '/api/jobs/:id/apply',
      ipAddress,
      userAgent,
      statusCode: 201,
      tags: ['user-action', 'job'],
    });
  }

  /**
   * Log job save
   */
  static async logJobSave(userId, userEmail, jobId, jobTitle, ipAddress, userAgent) {
    return this.log({
      userId,
      userEmail,
      action: 'job_save',
      resourceType: 'job',
      resourceId: jobId,
      resourceName: jobTitle,
      method: 'POST',
      endpoint: '/api/jobs/:id/save',
      ipAddress,
      userAgent,
      tags: ['user-action', 'job'],
    });
  }

  /**
   * Log message sent
   */
  static async logMessageSent(userId, userEmail, recipientId, messageId, ipAddress, userAgent) {
    return this.log({
      userId,
      userEmail,
      action: 'message_send',
      resourceType: 'message',
      resourceId: messageId,
      resourceName: `Message to ${recipientId}`,
      method: 'POST',
      endpoint: '/api/messages',
      ipAddress,
      userAgent,
      tags: ['communication', 'message'],
    });
  }

  /**
   * Log profile update
   */
  static async logProfileUpdate(userId, userEmail, userType, changes, ipAddress, userAgent) {
    return this.log({
      userId,
      userEmail,
      userType,
      action: 'profile_update',
      resourceType: 'user',
      resourceId: userId,
      method: 'PUT',
      endpoint: '/api/users/:id',
      ipAddress,
      userAgent,
      changes,
      tags: ['profile', 'user-action'],
    });
  }

  /**
   * Log password change
   */
  static async logPasswordChange(userId, userEmail, ipAddress, userAgent, success = true) {
    return this.log({
      userId,
      userEmail,
      action: 'password_change',
      resourceType: 'user',
      resourceId: userId,
      method: 'PUT',
      endpoint: '/api/users/:id/password',
      ipAddress,
      userAgent,
      success,
      severity: 'high',
      tags: ['security', 'authentication'],
    });
  }

  /**
   * Log payment action
   */
  static async logPayment(userId, userEmail, paymentId, action, amount, ipAddress, userAgent, success = true) {
    return this.log({
      userId,
      userEmail,
      action,
      resourceType: 'payment',
      resourceId: paymentId,
      resourceName: `Payment: ${amount}`,
      method: 'POST',
      endpoint: '/api/payments',
      ipAddress,
      userAgent,
      success,
      severity: success ? 'medium' : 'high',
      tags: ['payment', 'transaction'],
    });
  }

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(userId, userEmail, description, ipAddress, userAgent, details = {}) {
    return this.log({
      userId,
      userEmail,
      action: 'suspicious_activity',
      description,
      ipAddress,
      userAgent,
      severity: 'high',
      tags: ['security', 'alert'],
      details,
    });
  }

  /**
   * Log access denied
   */
  static async logAccessDenied(userId, userEmail, resource, endpoint, ipAddress, userAgent, reason = '') {
    return this.log({
      userId,
      userEmail,
      action: 'access_denied',
      resourceType: 'none',
      resourceName: resource,
      method: 'GET',
      endpoint,
      ipAddress,
      userAgent,
      statusCode: 403,
      success: false,
      severity: 'medium',
      description: reason,
      tags: ['security', 'authorization'],
    });
  }

  /**
   * Log error
   */
  static async logError(userId, userEmail, action, endpoint, error, ipAddress, userAgent, statusCode = 500) {
    return this.log({
      userId,
      userEmail,
      action: action || 'error_occurred',
      method: 'GET',
      endpoint,
      ipAddress,
      userAgent,
      statusCode,
      success: false,
      severity: statusCode >= 500 ? 'high' : 'medium',
      error: error.message || error,
      tags: ['error', 'system'],
    });
  }

  /**
   * Log data export
   */
  static async logDataExport(userId, userEmail, dataType, recordCount, ipAddress, userAgent) {
    return this.log({
      userId,
      userEmail,
      action: 'data_export',
      resourceType: 'none',
      resourceName: `${dataType} export`,
      method: 'GET',
      endpoint: `/api/${dataType}/export`,
      ipAddress,
      userAgent,
      severity: 'medium',
      details: { recordCount },
      tags: ['compliance', 'data-access'],
    });
  }

  /**
   * Log account deletion
   */
  static async logAccountDeletion(userId, userEmail, userType, ipAddress, userAgent) {
    return this.log({
      userId,
      userEmail,
      userType,
      action: 'account_delete',
      resourceType: 'user',
      resourceId: userId,
      method: 'DELETE',
      endpoint: '/api/users/:id',
      ipAddress,
      userAgent,
      severity: 'high',
      tags: ['account', 'compliance'],
    });
  }

  /**
   * Get audit logs with filters
   */
  static async getLogs(filter, limit = 100, skip = 0) {
    try {
      const logs = await AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'firstName lastName email');

      const total = await AuditLog.countDocuments(filter);

      return {
        success: true,
        total,
        count: logs.length,
        logs,
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's audit logs
   */
  static async getUserLogs(userId, limit = 50, skip = 0) {
    return this.getLogs({ userId }, limit, skip);
  }

  /**
   * Get logs by action
   */
  static async getLogsByAction(action, limit = 100, skip = 0, startDate = null, endDate = null) {
    const filter = { action };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    return this.getLogs(filter, limit, skip);
  }

  /**
   * Get statistics
   */
  static async getStatistics(startDate = null, endDate = null) {
    try {
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      const totalLogs = await AuditLog.countDocuments(dateFilter);

      const actionStats = await AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const severityStats = await AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]);

      return {
        totalLogs,
        actionStats,
        severityStats,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }
}

module.exports = AuditLogger;
