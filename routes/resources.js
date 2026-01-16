const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Resource = require('../models/Resource');
const { Op } = require('sequelize');

// Get all resources
router.get('/', async (req, res) => {
  try {
    const { category, resourceType, search, limit = 20, offset = 0 } = req.query;
    const where = { isPublic: true };

    if (category) where.category = category;
    if (resourceType) where.resourceType = resourceType;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const resources = await Resource.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['downloads', 'DESC'], ['rating', 'DESC']],
    });

    res.json({
      total: resources.count,
      data: resources.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.views += 1;
    await resource.save();

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload new resource
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      resourceType,
      fileUrl,
      fileName,
      fileSize,
      tags,
      version,
    } = req.body;

    const resource = await Resource.create({
      uploaderId: req.user.id,
      title,
      description,
      category,
      resourceType,
      fileUrl,
      fileName,
      fileSize,
      tags: tags || [],
      version,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Download resource
router.post('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.downloads += 1;
    await resource.save();

    // Return download link or redirect
    res.json({
      message: 'Download started',
      downloadLink: resource.fileUrl,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rate resource
router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { rating } = req.body;
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Simple average rating calculation
    const totalScore = resource.rating * resource.totalReviews + rating;
    resource.totalReviews += 1;
    resource.rating = totalScore / resource.totalReviews;
    await resource.save();

    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get resources by category
router.get('/category/:category', async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: {
        category: req.params.category,
        isPublic: true,
      },
      order: [['downloads', 'DESC']],
    });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
