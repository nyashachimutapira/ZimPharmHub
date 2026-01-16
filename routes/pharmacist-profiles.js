const express = require('express');
const {
  PharmacistProfile,
  Certification,
  PharmacistReview,
} = require('../models-sequelize');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all pharmacist profiles
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, pharmacyId, specialty } = req.query;
    const offset = (page - 1) * limit;

    let where = { isVerified: true };
    if (pharmacyId) where.pharmacyId = pharmacyId;

    const profiles = await PharmacistProfile.findAll({
      where,
      include: ['Certifications', { association: 'Reviews', limit: 5 }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['avgRating', 'DESC']],
    });

    // Filter by specialty if provided
    let filtered = profiles;
    if (specialty) {
      filtered = profiles.filter((p) =>
        p.specializations && p.specializations.includes(specialty)
      );
    }

    const total = filtered.length;

    res.json({
      profiles: filtered,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacist profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await PharmacistProfile.findByPk(req.params.id, {
      include: ['Certifications', 'Reviews'],
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user's pharmacist profile
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const profile = await PharmacistProfile.findOne({
      where: { userId: req.user.id },
      include: ['Certifications', 'Reviews'],
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update pharmacist profile
router.post('/', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const {
      pharmacyId,
      licenseNumber,
      licenseExpiry,
      specializations,
      yearsOfExperience,
      bio,
      languages,
      consultationAvailable,
      consultationRate,
    } = req.body;

    if (!licenseNumber || !licenseExpiry) {
      return res
        .status(400)
        .json({ error: 'License number and expiry are required' });
    }

    let profile = await PharmacistProfile.findOne({
      where: { userId: req.user.id },
    });

    const profileData = {
      pharmacyId,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      specializations: specializations
        ? JSON.parse(specializations)
        : [],
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
      bio,
      languages: languages ? JSON.parse(languages) : ['English'],
      consultationAvailable: consultationAvailable === 'true',
      consultationRate: consultationRate
        ? parseFloat(consultationRate)
        : 0,
      profileImage: req.file
        ? `/uploads/${req.file.filename}`
        : profile?.profileImage || null,
    };

    if (profile) {
      await profile.update(profileData);
    } else {
      profile = await PharmacistProfile.create({
        userId: req.user.id,
        ...profileData,
      });
    }

    // Fetch updated profile with associations
    const updatedProfile = await PharmacistProfile.findByPk(profile.id, {
      include: ['Certifications', 'Reviews'],
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add certification
router.post('/:profileId/certifications', authenticateToken, upload.single('certificate'), async (req, res) => {
  try {
    const { certificationName, issuingBody, dateObtained, expiryDate } = req.body;

    if (!certificationName || !issuingBody || !dateObtained) {
      return res
        .status(400)
        .json({ error: 'Missing required certification fields' });
    }

    const cert = await Certification.create({
      pharmacistProfileId: req.params.profileId,
      certificationName,
      issuingBody,
      dateObtained: new Date(dateObtained),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      certificateDocument: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(cert);
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get certifications for pharmacist
router.get('/:profileId/certifications', async (req, res) => {
  try {
    const certifications = await Certification.findAll({
      where: { pharmacistProfileId: req.params.profileId },
      order: [['dateObtained', 'DESC']],
    });

    res.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete certification
router.delete('/:profileId/certifications/:certId', authenticateToken, async (req, res) => {
  try {
    const cert = await Certification.findByPk(req.params.certId);

    if (!cert) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    const profile = await PharmacistProfile.findByPk(cert.pharmacistProfileId);
    if (profile.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await cert.destroy();
    res.json({ message: 'Certification deleted' });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for pharmacist
router.get('/:profileId/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await PharmacistReview.findAll({
      where: { pharmacistProfileId: req.params.profileId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ association: 'User', attributes: ['id', 'firstName', 'lastName'] }],
    });

    const total = await PharmacistReview.count({
      where: { pharmacistProfileId: req.params.profileId },
    });

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add review for pharmacist
router.post('/:profileId/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, comment, consultationDate } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await PharmacistReview.create({
      pharmacistProfileId: req.params.profileId,
      userId: req.user.id,
      rating,
      comment: comment || '',
      consultationDate: consultationDate ? new Date(consultationDate) : null,
      verifiedConsultation: true,
    });

    // Update average rating
    const allReviews = await PharmacistReview.findAll({
      where: { pharmacistProfileId: req.params.profileId },
    });

    const avgRating = (
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    ).toFixed(2);

    await PharmacistProfile.update(
      { avgRating: parseFloat(avgRating), totalReviews: allReviews.length },
      { where: { id: req.params.profileId } }
    );

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark review as helpful
router.patch('/:profileId/reviews/:reviewId/helpful', async (req, res) => {
  try {
    const { helpful } = req.body;
    const review = await PharmacistReview.findByPk(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (helpful) {
      review.helpful += 1;
    } else {
      review.notHelpful += 1;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Error marking review:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
