const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  // Message/Event Details
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: () => require('crypto').randomUUID(),
  },
  
  // Actor
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userEmail: String,
  userType: {
    type: String,
    enum: ['job_seeker', 'pharmacy', 'admin'],
  },

  // Action Details
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'password_change',
      'password_reset',
      'profile_update',
      'profile_view',
      'job_apply',
      'job_save',
      'job_unsave',
      'job_view',
      'job_create',
      'job_edit',
      'job_delete',
      'message_send',
      'message_receive',
      'message_read',
      'message_delete',
      'resume_upload',
      'resume_download',
      'payment_initiated',
      'payment_completed',
      'payment_failed',
      'subscription_upgrade',
      'subscription_downgrade',
      'email_sent',
      'email_failed',
      'notification_sent',
      'api_call',
      'data_export',
      'data_import',
      'settings_change',
      'permission_grant',
      'permission_revoke',
      'account_delete',
      'account_deactivate',
      'account_reactivate',
      'language_change',
      'timezone_change',
      'two_factor_enable',
      'two_factor_disable',
      'session_start',
      'session_end',
      'suspicious_activity',
      'access_denied',
      'error_occurred',
    ],
    index: true,
  },

  // Resource Details
  resourceType: {
    type: String,
    enum: [
      'user',
      'job',
      'application',
      'message',
      'payment',
      'subscription',
      'resume',
      'notification',
      'session',
      'api_key',
      'settings',
      'none',
    ],
    default: 'none',
    index: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  resourceName: String,

  // Request/Response
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'UI', 'SYSTEM'],
  },
  endpoint: String,
  statusCode: Number,
  statusMessage: String,

  // Context
  ipAddress: String,
  userAgent: String,
  referer: String,
  sessionId: String,

  // Changes Made (for updates)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
  },

  // Metadata
  description: String,
  details: mongoose.Schema.Types.Mixed, // Flexible field for additional context
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true,
  },
  tags: [String], // For categorization: ['security', 'payment', 'data-access']

  // Response
  duration: Number, // in milliseconds
  success: {
    type: Boolean,
    default: true,
  },
  error: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  // Compliance
  gdprRelevant: {
    type: Boolean,
    default: false,
  },
  hipaaRelevant: {
    type: Boolean,
    default: false,
  },
  complianceNotes: String,
});

// Indexes for common queries
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ severity: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ messageId: 1 }, { unique: true });

// TTL index for data retention (configurable)
// Keep logs for 1 year (31536000 seconds)
AuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 31536000 } // Adjust as needed for compliance
);

// Pre-save hook to validate
AuditLogSchema.pre('save', function (next) {
  // Ensure messageId is set
  if (!this.messageId) {
    this.messageId = require('crypto').randomUUID();
  }
  next();
});

// Virtual for formatted timestamp
AuditLogSchema.virtual('formattedTime').get(function () {
  return this.createdAt.toISOString();
});

// Virtual for action label
AuditLogSchema.virtual('actionLabel').get(function () {
  return this.action.replace(/_/g, ' ').toUpperCase();
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
