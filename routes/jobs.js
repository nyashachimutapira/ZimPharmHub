const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { auth } = require('../middleware/auth');

// Use Sequelize models (Postgres)
const Job = require('../models-sequelize/Job');
const JobApplication = require('../models-sequelize/JobApplication');
const User = require('../models-sequelize/User');
const Newsletter = require('../models/Newsletter');
const { notifySubscribers } = require('../utils/mailer');

const multer = require('multer');

// Multer storage for resumes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', 'uploads', 'resumes');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + require('path').extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    const allowed = /\.pdf|\.doc|\.docx$/i;
    if (allowed.test(require('path').extname(file.originalname))) cb(null, true);
    else cb(new Error('Only PDF/DOC/DOCX files are allowed'));
  }
});

// Get all jobs (Sequelize)
router.get('/', async (req, res) => {
  try {
    const { position, location, salary, search } = req.query;
    const where = { status: 'active' };

    if (position) where.position = position;
    if (location) where[Op.or] = [
      { locationCity: { [Op.iLike]: `%${location}%` } },
      { locationProvince: { [Op.iLike]: `%${location}%` } },
    ];
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const jobsRaw = await Job.findAll({
      where,
      order: [['featured', 'DESC'], ['createdAt', 'DESC']],
      limit: 20
    });

    // Attach minimal pharmacy info
    const jobs = await Promise.all(jobsRaw.map(async (j) => {
      const job = j.toJSON ? j.toJSON() : j;
      let pharmacy = null;
      if (job.pharmacyId) {
        const p = await User.findByPk(job.pharmacyId, { attributes: ['id', 'firstName', 'lastName', 'email'] });
        pharmacy = p ? p.toJSON() : null;
      }
      job.pharmacy = pharmacy;
      return job;
    }));

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Get job by ID (Sequelize)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // increment views
    try {
      job.increment('views');
    } catch (e) {
      console.error('Failed to increment views:', e.message);
    }

    const jobObj = job.toJSON();
    if (jobObj.pharmacyId) {
      const p = await User.findByPk(jobObj.pharmacyId, { attributes: ['id', 'firstName', 'lastName', 'email'] });
      jobObj.pharmacy = p ? p.toJSON() : null;
    }

    res.json(jobObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// Create job (Sequelize)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, position, salary, location, requirements, responsibilities, employmentType, featured, featuredUntil, expiresAt } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });

    // If featured is requested, ensure featuredUntil is a valid future date
    if (featured && featuredUntil) {
      const until = new Date(featuredUntil);
      if (isNaN(until.getTime())) return res.status(400).json({ message: 'Invalid featuredUntil date' });
    }

    // If expiresAt is provided ensure valid date
    if (expiresAt) {
      const expires = new Date(expiresAt);
      if (isNaN(expires.getTime())) return res.status(400).json({ message: 'Invalid expiresAt date' });
    }

    const jobData = {
      title,
      description,
      position,
      salaryMin: salary?.min || null,
      salaryMax: salary?.max || null,
      salaryCurrency: salary?.currency || 'ZWL',
      locationCity: location?.city || null,
      locationProvince: location?.province || null,
      locationAddress: location?.address || null,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      employmentType,
      pharmacyId: userId,
      featured: !!featured,
      featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    };

    const job = await Job.create(jobData);

    // Send email alerts to newsletter subscribers who opted into job alerts
    try {
      const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}`;
      const subject = `New job posted: ${job.title}`;
      const text = `A new job has been posted: ${job.title} at ${job.locationCity || 'Unknown'}. View: ${jobUrl}`;
      const html = `<p>A new job has been posted:</p><h3>${job.title}</h3><p>${job.description || ''}</p><p><a href="${jobUrl}">View job</a></p>`;
      notifySubscribers('jobs', subject, text, html);
    } catch (notifyErr) {
      console.warn('Failed to notify subscribers about new job:', notifyErr.message);
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const [updatedCount, updatedRows] = await Job.update(req.body, { where: { id: req.params.id }, returning: true });
    if (!updatedCount) return res.status(404).json({ message: 'Job not found' });
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// Set featured/unfeatured (admin or owner)
router.put('/:id/feature', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { featured, featuredUntil } = req.body;

    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Allow if admin or the job owner (pharmacy)
    if (req.user.userType !== 'admin' && job.pharmacyId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    job.featured = !!featured;
    job.featuredUntil = featuredUntil ? new Date(featuredUntil) : null;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating featured status', error: error.message });
  }
});

// Close job manually (admin or owner)
router.put('/:id/close', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.userType !== 'admin' && job.pharmacyId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    job.status = 'closed';
    await job.save();
    res.json({ message: 'Job closed', job });
  } catch (error) {
    res.status(500).json({ message: 'Error closing job', error: error.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Job.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

// Apply for job (Sequelize JobApplication)
router.post('/:id/apply', auth, upload.single('resume'), async (req, res) => {
  try {
    const userId = req.user.id;
    const coverLetter = req.body.coverLetter || '';

    // Check if resume is provided
    if (!req.file && !req.body.resume) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Prevent duplicate applications (unique index on user_id + job_id in model)
    try {
      let resumePath = null;
      if (req.file) {
        resumePath = `/uploads/resumes/${req.file.filename}`;
      } else if (req.body.resume) {
        resumePath = req.body.resume;
      }

      const application = await JobApplication.create({
        userId,
        jobId: job.id,
        resume: resumePath,
        coverLetter,
        status: 'pending'
      });

      // NOTE: Notifications currently not implemented in Postgres. Placeholder log:
      console.log(`✅ New application for job ${job.id} by user ${userId}`);

      res.json({ 
        message: 'Application submitted successfully', 
        application: {
          id: application.id,
          status: application.status,
          appliedAt: application.appliedAt
        }
      });
    } catch (err) {
      // Sequelize unique constraint violation (already applied)
      if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
        if (err.errors && err.errors.some(e => e.type === 'unique violation')) {
          return res.status(400).json({ message: 'You have already applied for this job' });
        }
        return res.status(400).json({ message: err.message || 'Validation error' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Error applying for job', error: error.message });
  }
});

// Update application status (for pharmacy owners)
router.put('/:jobId/applications/:applicationId/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await JobApplication.findByPk(req.params.applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Check if the application belongs to the specified job
    if (application.jobId !== req.params.jobId) {
      return res.status(400).json({ message: 'Application does not belong to this job' });
    }

    // Check if user owns the job or is admin
    const job = await Job.findByPk(application.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (req.user.userType !== 'admin' && job.pharmacyId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    application.status = status;
    if (notes) application.notes = notes;
    await application.save();

    // Placeholder for notification (migrate to PostgreSQL Notification model)
    console.log(`Notification placeholder: Application ${application.id} status changed to ${status}`);

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

// Get applications for a job (for pharmacy owners)
router.get('/:id/applications', auth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if user owns the job or is admin
    if (req.user.userType !== 'admin' && job.pharmacyId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const apps = await JobApplication.findAll({ where: { jobId: job.id }, order: [['appliedAt', 'DESC']] });
    const appsWithUser = await Promise.all(apps.map(async (a) => {
      const user = await User.findByPk(a.userId, { attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'resume', 'certifications'] });
      return { ...a.toJSON(), user: user ? user.toJSON() : null };
    }));

    res.json(appsWithUser);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// AI-Powered Job Recommendations
router.get('/recommendations/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can access their own recommendations
    if (req.user.id !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user's resume data
    const Resume = require('../models/Resume');
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please create a resume first.' });
    }

    // Get user's profile data
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'location', 'certifications']
    });

    // Get all active jobs
    const jobs = await Job.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    // Calculate match scores
    const recommendations = await Promise.all(jobs.map(async (job) => {
      const matchScore = calculateJobMatchScore(job, resume, user);
      return {
        ...job.toJSON(),
        matchScore,
        matchReasons: getMatchReasons(job, resume, user)
      };
    }));

    // Sort by match score and return top 10
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = recommendations.slice(0, 10);

    res.json({
      recommendations: topRecommendations,
      totalJobs: jobs.length
    });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

// Helper function to calculate match score (0-100)
function calculateJobMatchScore(job, resume, user) {
  let score = 0;
  let maxScore = 100;

  // Position match (30 points)
  if (job.position && resume.experience && resume.experience.length > 0) {
    const hasRelevantExperience = resume.experience.some(exp =>
      exp.jobTitle.toLowerCase().includes(job.position.toLowerCase()) ||
      exp.description.toLowerCase().includes(job.position.toLowerCase())
    );
    if (hasRelevantExperience) score += 30;
  }

  // Skills match (25 points)
  if (job.requirements && resume.skills) {
    const jobRequirements = job.requirements.join(' ').toLowerCase();
    const userSkills = resume.skills.flatMap(skill => skill.items).join(' ').toLowerCase();
    const skillMatches = jobRequirements.split(' ').filter(req =>
      userSkills.includes(req) || req.includes(userSkills.split(' ')[0])
    ).length;
    score += Math.min(skillMatches * 5, 25);
  }

  // Location match (15 points)
  if (job.locationCity && (user.location || resume.personalInfo.location)) {
    const userLocation = (user.location || resume.personalInfo.location || '').toLowerCase();
    const jobLocation = job.locationCity.toLowerCase();
    if (userLocation.includes(jobLocation) || jobLocation.includes(userLocation)) {
      score += 15;
    }
  }

  // Certifications match (15 points)
  const allUserCerts = [...(user.certifications || []), ...(resume.certifications || []).map(c => c.name)];
  if (job.requirements && allUserCerts.length > 0) {
    const certMatches = job.requirements.filter(req =>
      allUserCerts.some(cert => cert.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(cert.toLowerCase()))
    ).length;
    score += Math.min(certMatches * 5, 15);
  }

  // Experience level match (15 points)
  if (resume.experience && resume.experience.length > 0) {
    const totalExperience = resume.experience.reduce((total, exp) => {
      const endDate = exp.endDate || new Date();
      const startDate = new Date(exp.startDate);
      return total + (endDate - startDate) / (1000 * 60 * 60 * 24 * 365); // years
    }, 0);

    // Assume pharmacist roles need more experience
    if (job.position === 'Pharmacist' && totalExperience >= 2) score += 15;
    else if (job.position === 'Pharmacy Manager' && totalExperience >= 5) score += 15;
    else if (totalExperience >= 1) score += 10;
  }

  return Math.min(score, maxScore);
}

// Helper function to provide match reasons
function getMatchReasons(job, resume, user) {
  const reasons = [];

  // Position match
  if (job.position && resume.experience) {
    const hasRelevantExperience = resume.experience.some(exp =>
      exp.jobTitle.toLowerCase().includes(job.position.toLowerCase())
    );
    if (hasRelevantExperience) reasons.push('Relevant work experience');
  }

  // Skills match
  if (job.requirements && resume.skills) {
    const jobRequirements = job.requirements.join(' ').toLowerCase();
    const userSkills = resume.skills.flatMap(skill => skill.items).join(' ').toLowerCase();
    const matchingSkills = job.requirements.filter(req =>
      userSkills.includes(req.toLowerCase())
    );
    if (matchingSkills.length > 0) {
      reasons.push(`Skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
  }

  // Location match
  if (job.locationCity && user.location) {
    if (user.location.toLowerCase().includes(job.locationCity.toLowerCase())) {
      reasons.push('Location preference match');
    }
  }

  // Certifications match
  const allUserCerts = [...(user.certifications || []), ...(resume.certifications || []).map(c => c.name)];
  if (job.requirements && allUserCerts.length > 0) {
    const matchingCerts = job.requirements.filter(req =>
      allUserCerts.some(cert => cert.toLowerCase().includes(req.toLowerCase()))
    );
    if (matchingCerts.length > 0) {
      reasons.push(`Certifications match: ${matchingCerts.slice(0, 2).join(', ')}`);
    }
  }

  return reasons;
}

module.exports = router;
