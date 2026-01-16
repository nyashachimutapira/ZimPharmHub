const express = require('express');
const {
  InsuranceProvider,
  UserInsurance,
  InsuredOrder,
} = require('../models-sequelize');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all active insurance providers
router.get('/providers', async (req, res) => {
  try {
    const providers = await InsuranceProvider.findAll({
      where: { isActive: true },
      order: [['providerName', 'ASC']],
    });

    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific provider
router.get('/providers/:providerId', async (req, res) => {
  try {
    const provider = await InsuranceProvider.findByPk(req.params.providerId);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add user's insurance policy
router.post('/', authenticateToken, upload.single('documentProof'), async (req, res) => {
  try {
    const {
      providerId,
      policyNumber,
      memberName,
      dateOfBirth,
      membershipId,
      coverageType,
      expiryDate,
    } = req.body;

    if (!providerId || !policyNumber || !memberName || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if provider exists
    const provider = await InsuranceProvider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const insurance = await UserInsurance.create({
      userId: req.user.id,
      providerId,
      policyNumber,
      memberName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      membershipId,
      coverageType: coverageType || 'individual',
      expiryDate: new Date(expiryDate),
      documentProof: req.file ? `/uploads/${req.file.filename}` : null,
      isActive: true,
    });

    res.status(201).json(insurance);
  } catch (error) {
    console.error('Error adding insurance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's insurance policies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const insurances = await UserInsurance.findAll({
      where: { userId: req.user.id },
      include: [{ association: 'Provider', attributes: ['id', 'providerName', 'logo', 'contactPhone', 'contactEmail'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(insurances);
  } catch (error) {
    console.error('Error fetching insurances:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active insurance policies only
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const insurances = await UserInsurance.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
      },
      include: [{ association: 'Provider' }],
    });

    res.json(insurances);
  } catch (error) {
    console.error('Error fetching active insurances:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific insurance policy
router.get('/:insuranceId', authenticateToken, async (req, res) => {
  try {
    const insurance = await UserInsurance.findByPk(req.params.insuranceId, {
      include: [{ association: 'Provider' }],
    });

    if (!insurance) {
      return res.status(404).json({ error: 'Insurance policy not found' });
    }

    if (insurance.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(insurance);
  } catch (error) {
    console.error('Error fetching insurance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update insurance policy
router.put('/:insuranceId', authenticateToken, upload.single('documentProof'), async (req, res) => {
  try {
    const insurance = await UserInsurance.findByPk(req.params.insuranceId);

    if (!insurance) {
      return res.status(404).json({ error: 'Insurance policy not found' });
    }

    if (insurance.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      policyNumber,
      memberName,
      dateOfBirth,
      membershipId,
      coverageType,
      expiryDate,
    } = req.body;

    // Update fields
    if (policyNumber) insurance.policyNumber = policyNumber;
    if (memberName) insurance.memberName = memberName;
    if (dateOfBirth) insurance.dateOfBirth = new Date(dateOfBirth);
    if (membershipId) insurance.membershipId = membershipId;
    if (coverageType) insurance.coverageType = coverageType;
    if (expiryDate) insurance.expiryDate = new Date(expiryDate);
    if (req.file) insurance.documentProof = `/uploads/${req.file.filename}`;

    await insurance.save();
    res.json(insurance);
  } catch (error) {
    console.error('Error updating insurance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete insurance policy
router.delete('/:insuranceId', authenticateToken, async (req, res) => {
  try {
    const insurance = await UserInsurance.findByPk(req.params.insuranceId);

    if (!insurance) {
      return res.status(404).json({ error: 'Insurance policy not found' });
    }

    if (insurance.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await insurance.destroy();
    res.json({ message: 'Insurance policy deleted' });
  } catch (error) {
    console.error('Error deleting insurance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate insurance coverage for order
router.post('/calculate-coverage', authenticateToken, async (req, res) => {
  try {
    const { insuranceId, totalAmount } = req.body;

    if (!insuranceId || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insurance = await UserInsurance.findByPk(insuranceId);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }

    if (insurance.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if policy is active and not expired
    if (!insurance.isActive) {
      return res.status(400).json({ error: 'Insurance policy is inactive' });
    }

    if (new Date() > new Date(insurance.expiryDate)) {
      return res.status(400).json({ error: 'Insurance policy has expired' });
    }

    // Simple coverage calculation: 80% of prescription costs with $500 max per order
    const baseInsuranceCoverage = totalAmount * 0.8;
    const insuranceCoverage = Math.min(baseInsuranceCoverage, 500);
    const copay = Math.max(totalAmount * 0.1, 5); // 10% copay, minimum $5
    const deductible = 10; // Flat $10 deductible
    const userPayment = totalAmount - insuranceCoverage;

    res.json({
      totalAmount: parseFloat(totalAmount).toFixed(2),
      insuranceCoverage: parseFloat(insuranceCoverage).toFixed(2),
      copay: parseFloat(copay).toFixed(2),
      deductible: parseFloat(deductible).toFixed(2),
      userPayment: parseFloat(userPayment).toFixed(2),
      finalUserAmount: parseFloat(userPayment + copay + deductible).toFixed(2),
      message: 'Coverage calculated successfully',
    });
  } catch (error) {
    console.error('Error calculating coverage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create insured order record
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const {
      orderId,
      insuranceId,
      totalAmount,
      insuranceCoverage,
      userPayment,
      copay,
      deductible,
    } = req.body;

    if (!orderId || !insuranceId || !totalAmount || !userPayment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insurance = await UserInsurance.findByPk(insuranceId);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }

    if (insurance.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const insuredOrder = await InsuredOrder.create({
      orderId,
      userId: req.user.id,
      insuranceId,
      totalAmount: parseFloat(totalAmount),
      insuranceCoverage: parseFloat(insuranceCoverage) || 0,
      userPayment: parseFloat(userPayment),
      copayAmount: parseFloat(copay) || 0,
      deductibleApplied: parseFloat(deductible) || 0,
      insuranceStatus: 'pending_approval',
    });

    res.status(201).json(insuredOrder);
  } catch (error) {
    console.error('Error creating insured order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get insured orders for user
router.get('/orders/user/me', authenticateToken, async (req, res) => {
  try {
    const orders = await InsuredOrder.findAll({
      where: { userId: req.user.id },
      include: [{ association: 'Insurance', include: [{ association: 'Provider' }] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific insured order
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await InsuredOrder.findByPk(req.params.orderId, {
      include: [
        { association: 'Insurance', include: [{ association: 'Provider' }] },
        { association: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update insured order status
router.patch('/orders/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const { insuranceStatus, notes } = req.body;
    const order = await InsuredOrder.findByPk(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (insuranceStatus) {
      const validStatuses = [
        'pending_approval',
        'approved',
        'rejected',
        'partially_covered',
      ];
      if (!validStatuses.includes(insuranceStatus)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      order.insuranceStatus = insuranceStatus;
      order.approvalDate = new Date();
    }

    if (notes) order.notes = notes;

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
