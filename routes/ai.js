const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authenticate = require('../middleware/authenticate');
const aiService = require('../services/aiService');
const UserSkill = require('../models-sequelize/UserSkill');
const ResumeData = require('../models-sequelize/ResumeData');
const JobMatch = require('../models-sequelize/JobMatch');
const SalaryBenchmark = require('../models-sequelize/SalaryBenchmark');
const Job = require('../models-sequelize/Job');

const router = express.Router();

// ==========================================
// SKILL MANAGEMENT ENDPOINTS
// ==========================================

// Get user skills
router.get('/skills', authenticate, async (req, res) => {
  try {
    const skills = await UserSkill.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      skills,
      total: skills.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add skill
router.post('/skills/add', authenticate, async (req, res) => {
  try {
    const { skillName, proficiencyLevel = 'intermediate', yearsOfExperience = 1 } = req.body;

    if (!skillName) {
      return res.status(400).json({ success: false, error: 'Skill name is required' });
    }

    // Check if skill already exists
    const existingSkill = await UserSkill.findOne({
      where: { userId: req.user.id, skillName: skillName.toLowerCase() },
    });

    if (existingSkill) {
      return res.status(400).json({ success: false, error: 'Skill already added' });
    }

    const skill = await UserSkill.create({
      id: uuidv4(),
      userId: req.user.id,
      skillName: skillName.toLowerCase(),
      proficiencyLevel,
      yearsOfExperience,
    });

    res.json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update skill
router.put('/skills/:skillId', authenticate, async (req, res) => {
  try {
    const skill = await UserSkill.findOne({
      where: { id: req.params.skillId, userId: req.user.id },
    });

    if (!skill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }

    await skill.update(req.body);
    res.json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete skill
router.delete('/skills/:skillId', authenticate, async (req, res) => {
  try {
    const skill = await UserSkill.findOne({
      where: { id: req.params.skillId, userId: req.user.id },
    });

    if (!skill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }

    await skill.destroy();
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// RESUME ENDPOINTS
// ==========================================

// Get user resume data
router.get('/resume', authenticate, async (req, res) => {
  try {
    let resume = await ResumeData.findOne({
      where: { userId: req.user.id },
    });

    if (!resume) {
      resume = {
        userId: req.user.id,
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      };
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Parse resume (with file or text)
router.post('/resume/parse', authenticate, async (req, res) => {
  try {
    const { resumeText, fileUrl } = req.body;

    if (!resumeText && !fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'Resume text or file URL is required',
      });
    }

    // Parse resume using AI service
    const parsedData = await aiService.parseResumeText(resumeText || 'Resume from file');

    // Save or update resume data
    let resume = await ResumeData.findOne({
      where: { userId: req.user.id },
    });

    if (!resume) {
      resume = await ResumeData.create({
        id: uuidv4(),
        userId: req.user.id,
        ...parsedData,
        jsonData: parsedData,
        fileUrl,
        parsedAt: new Date(),
      });
    } else {
      await resume.update({
        ...parsedData,
        jsonData: parsedData,
        fileUrl,
        parsedAt: new Date(),
      });
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update resume data
router.put('/resume', authenticate, async (req, res) => {
  try {
    let resume = await ResumeData.findOne({
      where: { userId: req.user.id },
    });

    if (!resume) {
      resume = await ResumeData.create({
        id: uuidv4(),
        userId: req.user.id,
        ...req.body,
      });
    } else {
      await resume.update(req.body);
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// JOB RECOMMENDATIONS ENDPOINTS
// ==========================================

// Get job recommendations for user
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Get user skills
    const skills = await UserSkill.findAll({
      where: { userId: req.user.id },
    });

    // Get all available jobs
    const jobs = await Job.findAll({
      limit: parseInt(limit) + 10,
      offset: parseInt(offset),
      where: { status: 'active' },
    });

    // Generate recommendations using AI
    const recommendations = await aiService.generateJobRecommendations(
      skills,
      { yearsInPharmacy: req.user.yearsInPharmacy || 0 },
      jobs
    );

    // Save recommendations to job_matches table for tracking
    for (const rec of recommendations.recommendations || []) {
      await JobMatch.findOrCreate({
        where: { userId: req.user.id, jobId: rec.jobId },
        defaults: {
          id: uuidv4(),
          matchScore: rec.matchScore,
          matchedSkills: rec.matchedSkills,
          recommended: true,
        },
      });
    }

    res.json({
      success: true,
      recommendations: recommendations.recommendations || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate match score for a specific job
router.post('/match-job', authenticate, async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, error: 'Job ID is required' });
    }

    // Get user skills
    const skills = await UserSkill.findAll({
      where: { userId: req.user.id },
    });

    // Get job details
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Calculate match score
    const jobDescription = `${job.title}\n${job.description}\n${job.requirements || ''}`;
    const matchScore = await aiService.calculateJobMatchScore(
      skills,
      { yearsInPharmacy: req.user.yearsInPharmacy || 0 },
      jobDescription
    );

    // Save to database
    await JobMatch.findOrCreate({
      where: { userId: req.user.id, jobId },
      defaults: {
        id: uuidv4(),
        ...matchScore,
      },
    });

    res.json({ success: true, matchScore });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get saved job matches
router.get('/job-matches', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const matches = await JobMatch.findAndCountAll({
      where: { userId: req.user.id },
      order: [['matchScore', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      matches: matches.rows,
      total: matches.count,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// SALARY PREDICTION ENDPOINTS
// ==========================================

// Predict salary for a job
router.post('/salary-prediction', authenticate, async (req, res) => {
  try {
    const { jobTitle, yearsOfExperience = 0, location = 'Zimbabwe' } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ success: false, error: 'Job title is required' });
    }

    const prediction = await aiService.predictSalary(jobTitle, yearsOfExperience, location);

    res.json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get salary benchmarks
router.get('/salary-benchmarks', async (req, res) => {
  try {
    const { jobTitle, category, limit = 10 } = req.query;

    let where = {};
    if (jobTitle) where.jobTitle = { [require('sequelize').Op.like]: `%${jobTitle}%` };
    if (category) where.jobCategory = category;

    const benchmarks = await SalaryBenchmark.findAll({
      where,
      limit: parseInt(limit),
      order: [['avgSalary', 'DESC']],
    });

    res.json({ success: true, benchmarks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// JOB DESCRIPTION GENERATION ENDPOINTS
// ==========================================

// Generate job description
router.post('/generate-job-description', authenticate, async (req, res) => {
  try {
    const { jobTitle, company, responsibilities, requirements, salary } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({
        success: false,
        error: 'Job title and company are required',
      });
    }

    const jobDescription = await aiService.generateJobDescription(
      jobTitle,
      company,
      responsibilities,
      requirements,
      salary
    );

    res.json({ success: true, jobDescription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
