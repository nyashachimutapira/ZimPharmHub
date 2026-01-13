const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { auth } = require('../middleware/auth');
const PharmacyReview = require('../models/PharmacyReview');
const Pharmacy = require('../models-sequelize/Pharmacy');
const { sequelize } = require('../config/database');

// Get reviews for a pharmacy
router.get('/pharmacy/:pharmacyId', [
  param('pharmacyId').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { pharmacyId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await PharmacyReview.findAndCountAll({
      where: { pharmacyId, approved: true },
      order: [[sortBy, 'DESC']],
      limit: parseInt(limit),
      offset,
      attributes: {
        exclude: ['updatedAt'],
      },
    });

    return res.json({
      success: true,
      data: reviews.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reviews.count,
        pages: Math.ceil(reviews.count / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get pending reviews for moderation (admin/pharmacy owner)
router.get('/pending/:pharmacyId', auth, [
  param('pharmacyId').isUUID(),
], async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    // Check if user is pharmacy owner or admin
    const pharmacy = await Pharmacy.findByPk(pharmacyId);
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });
    if (pharmacy.userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const reviews = await PharmacyReview.findAll({
      where: { pharmacyId, approved: false },
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.error('Error fetching pending reviews:', err);
    return res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
});

// Create a review
router.post('/', auth, [
  body('pharmacyId').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').trim().notEmpty(),
  body('comment').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { pharmacyId, rating, title, comment } = req.body;

    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findByPk(pharmacyId);
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });

    // Check if user already reviewed this pharmacy
    const existingReview = await PharmacyReview.findOne({
      where: { pharmacyId, userId: req.user.id },
    });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this pharmacy' });
    }

    const review = await PharmacyReview.create({
      pharmacyId,
      userId: req.user.id,
      rating,
      title,
      comment,
      isPharmacist: req.user.userType === 'pharmacist',
    });

    return res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted for moderation',
    });
  } catch (err) {
    console.error('Error creating review:', err);
    return res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review
router.put('/:reviewId', auth, [
  param('reviewId').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').trim().notEmpty(),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await PharmacyReview.findByPk(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await review.update({
      rating,
      title,
      comment,
      approved: false, // Re-moderate after edit
    });

    return res.json({
      success: true,
      data: review,
      message: 'Review updated and sent for moderation',
    });
  } catch (err) {
    console.error('Error updating review:', err);
    return res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', auth, [
  param('reviewId').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { reviewId } = req.params;
    const review = await PharmacyReview.findByPk(reviewId);

    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await review.destroy();
    return res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Approve/reject review (admin/pharmacy owner)
router.patch('/:reviewId/approve', auth, [
  param('reviewId').isUUID(),
  body('approved').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { reviewId } = req.params;
    const { approved } = req.body;

    const review = await PharmacyReview.findByPk(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const pharmacy = await Pharmacy.findByPk(review.pharmacyId);
    if (pharmacy.userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await review.update({ approved });

    // Update pharmacy rating
    const approvedReviews = await PharmacyReview.findAll({
      where: { pharmacyId: review.pharmacyId, approved: true },
    });

    const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length || 0;
    await pharmacy.update({
      ratings: parseFloat(avgRating.toFixed(1)),
      totalReviews: approvedReviews.length,
    });

    return res.json({
      success: true,
      data: review,
      message: `Review ${approved ? 'approved' : 'rejected'}`,
    });
  } catch (err) {
    console.error('Error approving review:', err);
    return res.status(500).json({ error: 'Failed to approve review' });
  }
});

// Mark review as helpful/unhelpful
router.patch('/:reviewId/helpful', auth, [
  param('reviewId').isUUID(),
  body('helpful').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { reviewId } = req.params;
    const { helpful } = req.body;

    const review = await PharmacyReview.findByPk(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (helpful) {
      await review.increment('helpfulCount');
    } else {
      await review.increment('unhelpfulCount');
    }

    return res.json({
      success: true,
      data: review,
    });
  } catch (err) {
    console.error('Error marking review helpful:', err);
    return res.status(500).json({ error: 'Failed to update review' });
  }
});

// Get pharmacy stats
router.get('/stats/:pharmacyId', [
  param('pharmacyId').isUUID()
], async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    const reviews = await PharmacyReview.findAll({
      where: { pharmacyId, approved: true },
      attributes: ['rating'],
    });

    if (reviews.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return res.json({
      success: true,
      data: {
        averageRating: parseFloat(avgRating.toFixed(2)),
        totalReviews: reviews.length,
        ratingDistribution,
      },
    });
  } catch (err) {
    console.error('Error fetching review stats:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
