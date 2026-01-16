const express = require('express');
const {
  LoyaltyProgram,
  UserLoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyCoupon,
} = require('../models-sequelize');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Get loyalty program for a pharmacy
router.get('/program/:pharmacyId', async (req, res) => {
  try {
    const program = await LoyaltyProgram.findOne({
      where: { pharmacyId: req.params.pharmacyId, status: 'active' },
      include: ['Coupons'],
    });

    if (!program) {
      return res.status(404).json({ error: 'Loyalty program not found' });
    }

    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: error.message });
  }
});

// Join loyalty program
router.post('/:programId/join', authenticateToken, async (req, res) => {
  try {
    const existingAccount = await UserLoyaltyAccount.findOne({
      where: { userId: req.user.id, programId: req.params.programId },
    });

    if (existingAccount) {
      return res.status(400).json({ error: 'Already a member of this program' });
    }

    const account = await UserLoyaltyAccount.create({
      userId: req.user.id,
      programId: req.params.programId,
      memberSince: new Date(),
    });

    await LoyaltyProgram.increment('totalMembers', {
      where: { id: req.params.programId },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Error joining program:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all loyalty accounts for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const accounts = await UserLoyaltyAccount.findAll({
      where: { userId: req.user.id },
      include: [{ association: 'Program', include: ['Coupons'] }],
      order: [['memberSince', 'DESC']],
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific loyalty account
router.get('/:accountId', authenticateToken, async (req, res) => {
  try {
    const account = await UserLoyaltyAccount.findByPk(req.params.accountId, {
      include: [{ association: 'Program' }, { association: 'Transactions' }],
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get account transactions
router.get('/:accountId/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const account = await UserLoyaltyAccount.findByPk(req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const transactions = await LoyaltyTransaction.findAll({
      where: { accountId: req.params.accountId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await LoyaltyTransaction.count({
      where: { accountId: req.params.accountId },
    });

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add points (called after successful order)
router.post('/:accountId/add-points', async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const account = await UserLoyaltyAccount.findByPk(req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const program = await LoyaltyProgram.findByPk(account.programId);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const pointsToAdd = Math.floor(amount * program.pointsPerDollar);
    account.points = BigInt(account.points) + BigInt(pointsToAdd);
    account.lastActivityDate = new Date();

    // Update tier based on points
    const pointsValue = Number(account.points);
    if (pointsValue >= 10000) account.tier = 'platinum';
    else if (pointsValue >= 5000) account.tier = 'gold';
    else if (pointsValue >= 2000) account.tier = 'silver';

    await account.save();

    // Log transaction
    await LoyaltyTransaction.create({
      accountId: account.id,
      orderId: orderId || null,
      type: 'earn',
      points: pointsToAdd,
      description: `Earned ${pointsToAdd} points from order`,
    });

    // Update total points issued
    await LoyaltyProgram.increment('totalPointsIssued', {
      by: pointsToAdd,
      where: { id: program.id },
    });

    res.json(account);
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: error.message });
  }
});

// Redeem points
router.post('/:accountId/redeem', authenticateToken, async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Invalid points amount' });
    }

    const account = await UserLoyaltyAccount.findByPk(req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const program = await LoyaltyProgram.findByPk(account.programId);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const pointsValue = Number(account.points);
    if (points < program.minPointsToRedeem) {
      return res.status(400).json({
        error: `Minimum ${program.minPointsToRedeem} points required for redemption`,
      });
    }

    if (pointsValue < points) {
      return res
        .status(400)
        .json({ error: `Insufficient points. You have ${pointsValue} points` });
    }

    account.points = BigInt(account.points) - BigInt(points);
    account.pointsRedeemed = BigInt(account.pointsRedeemed) + BigInt(points);
    account.lastActivityDate = new Date();
    await account.save();

    // Log transaction
    await LoyaltyTransaction.create({
      accountId: account.id,
      type: 'redeem',
      points: -points,
      description: `Redeemed ${points} points`,
    });

    const discountValue = (points * program.redeemPointsValue).toFixed(2);
    res.json({
      account,
      discountValue,
      message: `Successfully redeemed ${points} points for $${discountValue} discount`,
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validate and apply coupon
router.post('/validate-coupon', async (req, res) => {
  try {
    const { couponCode, purchaseAmount } = req.body;

    if (!couponCode || !purchaseAmount) {
      return res.status(400).json({ error: 'Missing coupon code or purchase amount' });
    }

    const coupon = await LoyaltyCoupon.findOne({
      where: { couponCode: couponCode.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    if (coupon.maxUsageCount && coupon.usageCount >= coupon.maxUsageCount) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    if (
      coupon.minPurchaseAmount &&
      purchaseAmount < coupon.minPurchaseAmount
    ) {
      return res.status(400).json({
        error: `Minimum purchase amount $${coupon.minPurchaseAmount} required`,
      });
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = (purchaseAmount * coupon.discountPercent / 100).toFixed(2);
    } else if (coupon.discountAmount) {
      discount = parseFloat(coupon.discountAmount).toFixed(2);
    }

    const finalAmount = (purchaseAmount - discount).toFixed(2);

    res.json({
      valid: true,
      couponCode: coupon.couponCode,
      discountAmount: parseFloat(discount),
      finalAmount: parseFloat(finalAmount),
      message: `Coupon applied! Save $${discount}`,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply coupon (increment usage count)
router.post('/apply-coupon/:couponId', async (req, res) => {
  try {
    const coupon = await LoyaltyCoupon.findByPk(req.params.couponId);

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    coupon.usageCount += 1;
    await coupon.save();

    res.json({ message: 'Coupon applied', usageCount: coupon.usageCount });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
