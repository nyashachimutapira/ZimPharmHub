const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    example: 'My Pharmacy Resume v2',
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'pharmacy'],
    default: 'modern',
  },
  
  // Personal Information
  personalInfo: {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    summary: {
      type: String,
      required: false,
      maxlength: 500,
    },
  },

  // Work Experience
  experience: [
    {
      jobTitle: {
        type: String,
        required: true,
      },
      employer: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: false,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: false,
      },
      isCurrent: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        required: false,
        maxlength: 1000,
      },
    },
  ],

  // Education
  education: [
    {
      degree: {
        type: String,
        enum: ['High School', 'Diploma', 'Bachelor', 'Master', 'PhD'],
        required: true,
      },
      field: {
        type: String,
        required: true,
      },
      school: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: false,
      },
      graduationDate: {
        type: Date,
        required: true,
      },
      gpa: {
        type: String,
        required: false,
      },
    },
  ],

  // Certifications & Licenses
  certifications: [
    {
      name: {
        type: String,
        required: true,
      },
      issuer: {
        type: String,
        required: true,
      },
      issueDate: {
        type: Date,
        required: false,
      },
      expiryDate: {
        type: Date,
        required: false,
      },
      credentialUrl: {
        type: String,
        required: false,
      },
    },
  ],

  // Skills
  skills: [
    {
      category: {
        type: String,
        required: true,
        example: 'Technical Skills',
      },
      items: [
        {
          type: String,
        },
      ],
    },
  ],

  // Languages
  languages: [
    {
      language: {
        type: String,
        required: true,
      },
      proficiency: {
        type: String,
        enum: ['Native', 'Fluent', 'Intermediate', 'Basic'],
        default: 'Fluent',
      },
    },
  ],

  // Template Customization
  templateCustomization: {
    primaryColor: {
      type: String,
      default: '#003366',
    },
    secondaryColor: {
      type: String,
      default: '#0066cc',
    },
    accentColor: {
      type: String,
      default: '#00bfff',
    },
    fontFamily: {
      type: String,
      enum: ['Arial', 'Calibri', 'Times New Roman', 'Georgia'],
      default: 'Arial',
    },
  },

  // Additional Custom Sections
  additionalSections: [
    {
      title: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],

  // Metadata
  isDefault: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsedAt: Date,
  lastDownloadedAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
ResumeSchema.index({ userId: 1, createdAt: -1 });
ResumeSchema.index({ userId: 1, isDefault: 1 });

// Virtual for completion percentage
ResumeSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  let total = 9; // Total sections

  if (this.personalInfo && this.personalInfo.fullName) completed++;
  if (this.experience && this.experience.length > 0) completed++;
  if (this.education && this.education.length > 0) completed++;
  if (this.certifications && this.certifications.length > 0) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.languages && this.languages.length > 0) completed++;
  if (this.template) completed++;
  if (this.templateCustomization) completed++;
  if (this.personalInfo && this.personalInfo.summary) completed++;

  return Math.round((completed / total) * 100);
});

// Pre-save hook to update updatedAt
ResumeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Resume', ResumeSchema);
