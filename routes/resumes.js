const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');

/**
 * Create a new resume
 * POST /api/resumes
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const { title, template, personalInfo } = req.body;

    if (!title || !personalInfo || !personalInfo.fullName) {
      return res.status(400).json({ message: 'Title and personal info required' });
    }

    // If this is the first resume, set it as default
    const existingResumes = await Resume.countDocuments({ userId });
    const isDefault = existingResumes === 0;

    const resume = new Resume({
      userId,
      title,
      template: template || 'modern',
      personalInfo,
      isDefault,
    });

    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating resume',
      error: error.message,
    });
  }
});

/**
 * Get all resumes for a user
 * GET /api/resumes
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const resumes = await Resume.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes',
      error: error.message,
    });
  }
});

/**
 * Get a single resume
 * GET /api/resumes/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message,
    });
  }
});

/**
 * Update a resume
 * PUT /api/resumes/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { id } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'template',
      'personalInfo',
      'experience',
      'education',
      'certifications',
      'skills',
      'languages',
      'templateCustomization',
      'additionalSections',
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        resume[key] = updates[key];
      }
    });

    resume.updatedAt = new Date();
    await resume.save();

    res.json({
      success: true,
      message: 'Resume updated successfully',
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resume',
      error: error.message,
    });
  }
});

/**
 * Delete a resume
 * DELETE /api/resumes/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // If deleting default resume, set another as default
    if (resume.isDefault) {
      const nextResume = await Resume.findOne({
        userId,
        _id: { $ne: id },
      });
      if (nextResume) {
        nextResume.isDefault = true;
        await nextResume.save();
      }
    }

    await Resume.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message,
    });
  }
});

/**
 * Duplicate a resume
 * POST /api/resumes/:id/duplicate
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { id } = req.params;
    const { newTitle } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const originalResume = await Resume.findById(id);

    if (!originalResume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (originalResume.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create a copy
    const resumeCopy = {
      ...originalResume.toObject(),
      _id: undefined,
      title: newTitle || `${originalResume.title} (Copy)`,
      isDefault: false,
      usageCount: 0,
      lastUsedAt: undefined,
      lastDownloadedAt: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };

    const newResume = new Resume(resumeCopy);
    await newResume.save();

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully',
      resume: newResume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error duplicating resume',
      error: error.message,
    });
  }
});

/**
 * Set a resume as default
 * POST /api/resumes/:id/set-default
 */
router.post('/:id/set-default', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Unset previous default
    await Resume.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Set this as default
    resume.isDefault = true;
    await resume.save();

    res.json({
      success: true,
      message: 'Resume set as default',
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting default resume',
      error: error.message,
    });
  }
});

/**
 * Track resume download
 * POST /api/resumes/:id/download
 */
router.post('/:id/download', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update usage tracking
    resume.usageCount = (resume.usageCount || 0) + 1;
    resume.lastDownloadedAt = new Date();
    resume.lastUsedAt = new Date();
    await resume.save();

    res.json({
      success: true,
      message: 'Download tracked',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error tracking download',
      error: error.message,
    });
  }
});

/**
 * Get resume templates
 * GET /api/resume-templates
 */
router.get('/templates/list', async (req, res) => {
  try {
    const templates = [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean, contemporary design with colorful accents',
        layout: 'sidebar',
        colors: {
          primary: '#003366',
          secondary: '#0066cc',
          accent: '#00bfff',
        },
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional professional look with serif fonts',
        layout: 'column',
        colors: {
          primary: '#2c3e50',
          secondary: '#34495e',
          accent: '#3498db',
        },
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Ultra-clean design with minimal color usage',
        layout: 'standard',
        colors: {
          primary: '#333',
          secondary: '#666',
          accent: '#999',
        },
      },
      {
        id: 'pharmacy',
        name: 'Pharmacy Professional',
        description: 'Tailored for pharmacy professionals with certification emphasis',
        layout: 'pharmacy',
        colors: {
          primary: '#1a5f7a',
          secondary: '#2980b9',
          accent: '#27ae60',
        },
      },
    ];

    res.json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message,
    });
  }
});

module.exports = router;
