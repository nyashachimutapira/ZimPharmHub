const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Use Sequelize models (Postgres)
const Job = require('../models-sequelize/Job');
const JobApplication = require('../models-sequelize/JobApplication');
const User = require('../models-sequelize/User');

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
router.post('/', async (req, res) => {
  try {
    const { title, description, position, salary, location, requirements, responsibilities, employmentType } = req.body;
    const userId = req.headers['user-id'];

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
    };

    const job = await Job.create(jobData);

    // Note: Saved-search alerts are disabled until migrated to Sequelize.
    console.log('ℹ️ Saved-search alerts are disabled (pending migration).');

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
router.post('/:id/apply', upload.single('resume'), async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const coverLetter = req.body.coverLetter || '';
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Prevent duplicate applications (unique index on user_id + job_id in model)
    try {
      let resumePath = null;
      if (req.file) resumePath = `/uploads/resumes/${req.file.filename}`;
      else if (req.body.resume) resumePath = req.body.resume;

      const application = await JobApplication.create({
        userId,
        jobId: job.id,
        resume: resumePath,
        coverLetter,
        status: 'pending'
      });

      // NOTE: Notifications currently not implemented in Postgres. Placeholder log:
      console.log(`Notification placeholder: New application for job ${job.id} by user ${userId}`);

      res.json({ message: 'Application submitted', application });
    } catch (err) {
      // Sequelize unique constraint violation (already applied)
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Already applied for this job' });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job', error: error.message });
  }
});

// Update application status (for pharmacy owners)
router.put('/:jobId/applications/:applicationId/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await JobApplication.findByPk(req.params.applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

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
router.get('/:id/applications', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

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

module.exports = router;
