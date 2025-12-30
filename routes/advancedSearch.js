const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Job = require('../models-sequelize/Job');
const User = require('../models-sequelize/User');
const SavedFilter = require('../models/SavedFilter');

/**
 * Advanced search with multiple filters and sorting
 */
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      positions,
      locations,
      salaryMin,
      salaryMax,
      employmentTypes,
      experience,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      mapView = false,
    } = req.query;

    // Build where clause
    const where = { status: 'active' };
    const order = [];

    // Text search (keywords/title/description)
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Position filter
    if (positions) {
      const posArray = Array.isArray(positions) ? positions : [positions];
      where.position = { [Op.in]: posArray };
    }

    // Location filter
    if (locations) {
      const locArray = Array.isArray(locations) ? locations : [locations];
      where[Op.or] = (where[Op.or] || []).concat(
        locArray.map(loc => ({
          [Op.or]: [
            { locationCity: { [Op.iLike]: `%${loc}%` } },
            { locationProvince: { [Op.iLike]: `%${loc}%` } },
          ],
        }))
      );
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      const salaryWhere = {};
      if (salaryMin) {
        salaryWhere[Op.gte] = parseInt(salaryMin);
      }
      if (salaryMax) {
        salaryWhere[Op.lte] = parseInt(salaryMax);
      }
      where.salaryMax = salaryWhere;
    }

    // Employment type filter
    if (employmentTypes) {
      const typeArray = Array.isArray(employmentTypes) ? employmentTypes : [employmentTypes];
      where.employmentType = { [Op.in]: typeArray };
    }

    // Experience filter (infer from job requirements)
    // Note: This is approximate based on requirements string
    if (experience && experience !== 'Any') {
      // This is a simplified approach - would need better data structure
      // For now, we'll skip complex experience filtering
    }

    // Sorting
    switch (sortBy) {
      case 'date':
        order.push(['createdAt', sortOrder === 'asc' ? 'ASC' : 'DESC']);
        break;
      case 'salary':
        order.push(['salaryMax', sortOrder === 'asc' ? 'ASC' : 'DESC']);
        break;
      case 'relevance':
      default:
        // Relevance: featured first, then by date
        order.push(['featured', 'DESC']);
        order.push(['createdAt', 'DESC']);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch jobs
    const { count, rows } = await Job.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
    });

    // Enrich with pharmacy info
    const jobs = await Promise.all(
      rows.map(async job => {
        const jobObj = job.toJSON();
        if (jobObj.pharmacyId) {
          const pharmacy = await User.findByPk(jobObj.pharmacyId, {
            attributes: ['id', 'firstName', 'lastName', 'email'],
          });
          if (pharmacy) {
            jobObj.pharmacy = pharmacy.toJSON();
          }
        }
        return jobObj;
      })
    );

    // Map view format (simplified coordinates)
    let mapData = [];
    if (mapView === 'true') {
      mapData = jobs.map(job => ({
        id: job.id,
        title: job.title,
        position: job.position,
        location: `${job.locationCity || ''} ${job.locationProvince || ''}`.trim(),
        latitude: getLatitude(job.locationCity), // Mock coordinates
        longitude: getLongitude(job.locationCity),
        salary: `${job.salaryMin || 'N/A'} - ${job.salaryMax || 'N/A'}`,
        pharmacy: job.pharmacy ? `${job.pharmacy.firstName} ${job.pharmacy.lastName}` : 'Unknown',
      }));
    }

    res.json({
      success: true,
      totalResults: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      hasMore: offset + parseInt(limit) < count,
      results: jobs,
      mapData: mapView === 'true' ? mapData : undefined,
      filters: {
        query: q,
        positions,
        locations,
        salaryMin,
        salaryMax,
        employmentTypes,
        experience,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message,
    });
  }
});

/**
 * Get available filter options (for UI dropdowns)
 */
router.get('/filters/options', async (req, res) => {
  try {
    // Get distinct values from database
    const jobs = await Job.findAll({
      where: { status: 'active' },
      attributes: ['position', 'locationCity', 'locationProvince', 'employmentType'],
      raw: true,
    });

    // Extract unique values
    const positions = [...new Set(jobs.map(j => j.position).filter(Boolean))];
    const locations = [
      ...new Set(
        jobs
          .flatMap(j => [j.locationCity, j.locationProvince])
          .filter(Boolean)
      ),
    ].sort();
    const employmentTypes = [...new Set(jobs.map(j => j.employmentType).filter(Boolean))];

    // Get salary ranges
    const salaryStats = await Job.findAll({
      where: { status: 'active' },
      attributes: [
        [require('sequelize').fn('MIN', require('sequelize').col('salaryMin')), 'minSalary'],
        [require('sequelize').fn('MAX', require('sequelize').col('salaryMax')), 'maxSalary'],
      ],
      raw: true,
    });

    const minSalary = salaryStats[0]?.minSalary || 0;
    const maxSalary = salaryStats[0]?.maxSalary || 100000;

    res.json({
      success: true,
      positions,
      locations,
      employmentTypes,
      salaryRange: {
        min: minSalary,
        max: maxSalary,
      },
      experience: ['0-1 years', '1-3 years', '3-5 years', '5+ years', 'Any'],
      sortOptions: [
        { value: 'relevance', label: 'Relevance' },
        { value: 'date', label: 'Date Posted' },
        { value: 'salary', label: 'Salary' },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message,
    });
  }
});

/**
 * Save a search filter
 */
router.post('/filters', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const {
      name,
      description,
      positions,
      locations,
      salaryMin,
      salaryMax,
      employmentTypes,
      experience,
      keywords,
      sortBy = 'relevance',
      sortOrder = 'desc',
      isDefault = false,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Filter name is required' });
    }

    const savedFilter = await SavedFilter.create({
      userId,
      name,
      description,
      positions: positions || [],
      locations: locations || [],
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      employmentTypes: employmentTypes || [],
      experience: experience || 'Any',
      keywords: keywords || [],
      sortBy,
      sortOrder,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: 'Search filter saved',
      filter: savedFilter,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Filter with this name already exists' });
    }
    res.status(500).json({
      success: false,
      message: 'Error saving filter',
      error: error.message,
    });
  }
});

/**
 * Get all saved filters for user
 */
router.get('/filters', async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const filters = await SavedFilter.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: filters.length,
      filters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching filters',
      error: error.message,
    });
  }
});

/**
 * Get specific saved filter
 */
router.get('/filters/:filterId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { filterId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const filter = await SavedFilter.findById(filterId);

    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }

    if (filter.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({
      success: true,
      filter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching filter',
      error: error.message,
    });
  }
});

/**
 * Update saved filter
 */
router.put('/filters/:filterId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { filterId } = req.params;
    const {
      name,
      description,
      positions,
      locations,
      salaryMin,
      salaryMax,
      employmentTypes,
      experience,
      keywords,
      sortBy,
      sortOrder,
      isDefault,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const filter = await SavedFilter.findById(filterId);

    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }

    if (filter.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update fields
    if (name !== undefined) filter.name = name;
    if (description !== undefined) filter.description = description;
    if (positions !== undefined) filter.positions = positions;
    if (locations !== undefined) filter.locations = locations;
    if (salaryMin !== undefined) filter.salaryMin = salaryMin;
    if (salaryMax !== undefined) filter.salaryMax = salaryMax;
    if (employmentTypes !== undefined) filter.employmentTypes = employmentTypes;
    if (experience !== undefined) filter.experience = experience;
    if (keywords !== undefined) filter.keywords = keywords;
    if (sortBy !== undefined) filter.sortBy = sortBy;
    if (sortOrder !== undefined) filter.sortOrder = sortOrder;
    if (isDefault !== undefined) filter.isDefault = isDefault;

    filter.updatedAt = new Date();
    await filter.save();

    res.json({
      success: true,
      message: 'Filter updated',
      filter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating filter',
      error: error.message,
    });
  }
});

/**
 * Delete saved filter
 */
router.delete('/filters/:filterId', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { filterId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const filter = await SavedFilter.findById(filterId);

    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }

    if (filter.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await SavedFilter.findByIdAndDelete(filterId);

    res.json({
      success: true,
      message: 'Filter deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting filter',
      error: error.message,
    });
  }
});

/**
 * Apply saved filter (search with filter)
 */
router.post('/filters/:filterId/apply', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { filterId } = req.params;
    const { page = 1, limit = 20, mapView = false } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const filter = await SavedFilter.findById(filterId);

    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }

    if (filter.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Build search query from filter
    const where = { status: 'active' };
    const order = [];

    if (filter.positions && filter.positions.length > 0) {
      where.position = { [Op.in]: filter.positions };
    }

    if (filter.locations && filter.locations.length > 0) {
      where[Op.or] = filter.locations.map(loc => ({
        [Op.or]: [
          { locationCity: { [Op.iLike]: `%${loc}%` } },
          { locationProvince: { [Op.iLike]: `%${loc}%` } },
        ],
      }));
    }

    if (filter.salaryMin || filter.salaryMax) {
      const salaryWhere = {};
      if (filter.salaryMin) salaryWhere[Op.gte] = filter.salaryMin;
      if (filter.salaryMax) salaryWhere[Op.lte] = filter.salaryMax;
      where.salaryMax = salaryWhere;
    }

    if (filter.employmentTypes && filter.employmentTypes.length > 0) {
      where.employmentType = { [Op.in]: filter.employmentTypes };
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'date':
        order.push(['createdAt', filter.sortOrder === 'asc' ? 'ASC' : 'DESC']);
        break;
      case 'salary':
        order.push(['salaryMax', filter.sortOrder === 'asc' ? 'ASC' : 'DESC']);
        break;
      case 'relevance':
      default:
        order.push(['featured', 'DESC']);
        order.push(['createdAt', 'DESC']);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch jobs
    const { count, rows } = await Job.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
    });

    // Enrich with pharmacy info
    const jobs = await Promise.all(
      rows.map(async job => {
        const jobObj = job.toJSON();
        if (jobObj.pharmacyId) {
          const pharmacy = await User.findByPk(jobObj.pharmacyId, {
            attributes: ['id', 'firstName', 'lastName', 'email'],
          });
          if (pharmacy) {
            jobObj.pharmacy = pharmacy.toJSON();
          }
        }
        return jobObj;
      })
    );

    // Update usage statistics
    filter.usageCount += 1;
    filter.lastUsed = new Date();
    await filter.save();

    res.json({
      success: true,
      filterName: filter.name,
      totalResults: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      hasMore: offset + parseInt(limit) < count,
      results: jobs,
      filterUsed: {
        id: filter._id,
        name: filter.name,
        positions: filter.positions,
        locations: filter.locations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error applying filter',
      error: error.message,
    });
  }
});

/**
 * Get popular filters (for recommendations)
 */
router.get('/filters/popular', async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const popularFilters = await SavedFilter.find({ userId })
      .sort({ usageCount: -1 })
      .limit(5);

    res.json({
      success: true,
      count: popularFilters.length,
      filters: popularFilters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular filters',
      error: error.message,
    });
  }
});

/**
 * Helper functions for map view coordinates
 * In production, these would use actual geocoding
 */
function getLatitude(city) {
  const coordinates = {
    Harare: -17.8252,
    Bulawayo: -20.1599,
    Chitungwiza: -17.9992,
    Mutare: -18.9667,
    Gweru: -19.4517,
    Kwekwe: -18.9256,
  };
  return coordinates[city] || -19.0;
}

function getLongitude(city) {
  const coordinates = {
    Harare: 31.0335,
    Bulawayo: 28.5796,
    Chitungwiza: 31.0161,
    Mutare: 32.6669,
    Gweru: 29.7747,
    Kwekwe: 29.8256,
  };
  return coordinates[city] || 30.0;
}

module.exports = router;
