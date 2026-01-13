const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// ============================================================
// PAYROLL ENDPOINTS
// ============================================================

// Get all payroll records
router.get('/payroll', async (req, res) => {
  try {
    const { pharmacyId, staffId, status } = req.query;
    const where = {};
    
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;

    const payroll = await sequelize.models.Payroll.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payroll record
router.post('/payroll', async (req, res) => {
  try {
    const { staffId, pharmacyId, payPeriodStart, payPeriodEnd, baseSalary, allowances, deductions, taxDeduction, paymentMethod } = req.body;

    const bonus = req.body.bonus || 0;
    const netSalary = parseFloat(baseSalary) + parseFloat(allowances) + parseFloat(bonus) - parseFloat(deductions) - parseFloat(taxDeduction);

    const payroll = await sequelize.models.Payroll.create({
      staffId,
      pharmacyId,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      allowances,
      bonus,
      deductions,
      taxDeduction,
      netSalary,
      paymentMethod,
    });

    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve payroll
router.put('/payroll/:id/approve', async (req, res) => {
  try {
    const payroll = await sequelize.models.Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ error: 'Payroll not found' });

    await payroll.update({ status: 'Approved' });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as paid
router.put('/payroll/:id/pay', async (req, res) => {
  try {
    const payroll = await sequelize.models.Payroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ error: 'Payroll not found' });

    await payroll.update({ 
      status: 'Paid',
      paymentDate: new Date()
    });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SHIFT MANAGEMENT ENDPOINTS
// ============================================================

// Get all shifts
router.get('/shifts', async (req, res) => {
  try {
    const { pharmacyId, date, status } = req.query;
    const where = {};
    
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (status) where.status = status;
    if (date) where.date = new Date(date);

    const shifts = await sequelize.models.Shift.findAll({
      where,
      order: [['date', 'ASC'], ['startTime', 'ASC']],
    });

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create shift
router.post('/shifts', async (req, res) => {
  try {
    const { pharmacyId, staffId, shiftName, date, startTime, endTime, shiftType } = req.body;

    const shift = await sequelize.models.Shift.create({
      pharmacyId,
      staffId,
      shiftName,
      date,
      startTime,
      endTime,
      shiftType,
    });

    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update shift status
router.put('/shifts/:id', async (req, res) => {
  try {
    const shift = await sequelize.models.Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ error: 'Shift not found' });

    await shift.update(req.body);
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff availability for a date
router.get('/shifts/availability/:date', async (req, res) => {
  try {
    const shifts = await sequelize.models.Shift.findAll({
      where: { date: new Date(req.params.date) },
    });

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SUPPLIER MANAGEMENT ENDPOINTS
// ============================================================

// Get all suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { pharmacyId, status } = req.query;
    const where = {};
    
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (status) where.status = status;

    const suppliers = await sequelize.models.Supplier.findAll({
      where,
      order: [['name', 'ASC']],
    });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create supplier
router.post('/suppliers', async (req, res) => {
  try {
    const supplier = await sequelize.models.Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update supplier
router.put('/suppliers/:id', async (req, res) => {
  try {
    const supplier = await sequelize.models.Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SUPPLIER ORDER ENDPOINTS
// ============================================================

// Get all orders
router.get('/supplier-orders', async (req, res) => {
  try {
    const { pharmacyId, supplierId, status } = req.query;
    const where = {};
    
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const orders = await sequelize.models.SupplierOrder.findAll({
      where,
      include: ['Supplier'],
      order: [['orderDate', 'DESC']],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/supplier-orders', async (req, res) => {
  try {
    const orderNumber = `ORD-${Date.now()}`;
    const order = await sequelize.models.SupplierOrder.create({
      ...req.body,
      orderNumber,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/supplier-orders/:id', async (req, res) => {
  try {
    const order = await sequelize.models.SupplierOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// INVOICE ENDPOINTS
// ============================================================

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const { pharmacyId, status } = req.query;
    const where = {};
    
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (status) where.status = status;

    const invoices = await sequelize.models.Invoice.findAll({
      where,
      order: [['invoiceDate', 'DESC']],
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
router.post('/invoices', async (req, res) => {
  try {
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = await sequelize.models.Invoice.create({
      ...req.body,
      invoiceNumber,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record payment
router.put('/invoices/:id/payment', async (req, res) => {
  try {
    const { amountPaid } = req.body;
    const invoice = await sequelize.models.Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const totalPaid = parseFloat(invoice.amountPaid) + parseFloat(amountPaid);
    const newStatus = totalPaid >= invoice.totalAmount ? 'Paid' : 'Partial';

    await invoice.update({
      amountPaid: totalPaid,
      status: newStatus,
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// CAMPAIGN ENDPOINTS
// ============================================================

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const { pharmacyId, status } = req.query;
    const where = {};
    
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (status) where.status = status;

    const campaigns = await sequelize.models.Campaign.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create campaign
router.post('/campaigns', async (req, res) => {
  try {
    const campaign = await sequelize.models.Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule campaign
router.put('/campaigns/:id/schedule', async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const campaign = await sequelize.models.Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await campaign.update({
      scheduledDate,
      status: 'Scheduled',
    });

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send campaign immediately
router.put('/campaigns/:id/send', async (req, res) => {
  try {
    const campaign = await sequelize.models.Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Here you would integrate with SMS/Email providers
    await campaign.update({
      status: 'Sent',
      sentCount: campaign.totalRecipients,
    });

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update campaign
router.put('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await sequelize.models.Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await campaign.update(req.body);
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// REPORTS ENDPOINTS
// ============================================================

// Get sales report
router.get('/reports/sales', async (req, res) => {
  try {
    const { pharmacyId, startDate, endDate } = req.query;

    const query = `
      SELECT 
        DATE(j.createdAt) as date,
        COUNT(*) as totalJobs,
        SUM(CASE WHEN j.status = 'filled' THEN 1 ELSE 0 END) as filledJobs,
        COUNT(DISTINCT ja.userId) as uniqueApplicants
      FROM jobs j
      LEFT JOIN job_applications ja ON j.id = ja.jobId
      WHERE j.pharmacyId = $1
        AND j.createdAt BETWEEN $2 AND $3
      GROUP BY DATE(j.createdAt)
      ORDER BY date DESC
    `;

    const sales = await sequelize.query(query, {
      replacements: [pharmacyId, startDate, endDate],
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff report
router.get('/reports/staff', async (req, res) => {
  try {
    const { pharmacyId } = req.query;

    const staff = await sequelize.models.StaffMember.findAll({
      where: { pharmacyId },
      attributes: ['id', 'firstName', 'lastName', 'position', 'status', 'hireDate'],
    });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory report
router.get('/reports/payroll', async (req, res) => {
  try {
    const { pharmacyId, startDate, endDate } = req.query;

    const payroll = await sequelize.models.Payroll.findAll({
      where: {
        pharmacyId,
        payPeriodStart: { [sequelize.Sequelize.Op.gte]: startDate },
        payPeriodEnd: { [sequelize.Sequelize.Op.lte]: endDate },
      },
      order: [['payPeriodStart', 'DESC']],
    });

    const totalExpenditure = payroll.reduce((sum, p) => sum + parseFloat(p.netSalary), 0);

    res.json({
      data: payroll,
      totalExpenditure,
      recordCount: payroll.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
