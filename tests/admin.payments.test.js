const request = require('supertest');
const app = require('../server');

// Mock Mongoose User model used by admin middleware
jest.mock('../models/User', () => ({
  findById: jest.fn().mockResolvedValue({ _id: 'admin-1', userType: 'admin' })
}));

// Mock Sequelize models used by admin routes
const paymentMock = { id: 'pay-1', jobId: 'job-1', userId: 'user-1', amount: '10.00', currency: 'usd', providerId: 'pi_1', receiptSent: false, ownerNotified: false, save: jest.fn(), toJSON() { return this; } };

jest.mock('../models-sequelize/Payment', () => ({
  findAll: jest.fn().mockResolvedValue([paymentMock]),
  findByPk: jest.fn().mockImplementation((id) => {
    if (id === 'pay-1') return Promise.resolve(paymentMock);
    return Promise.resolve(null);
  })
}));

jest.mock('../models-sequelize/Job', () => ({
  findByPk: jest.fn().mockImplementation((id) => {
    if (id === 'job-1') return Promise.resolve({ id: 'job-1', featured: false, featuredUntil: null, save: jest.fn(), toJSON() { return this; } });
    return Promise.resolve(null);
  })
}));

jest.mock('../models-sequelize/User', () => ({
  findByPk: jest.fn().mockResolvedValue({ id: 'user-1', firstName: 'Alice', lastName: 'Admin', email: 'alice@example.com', toJSON() { return this; } })
}));

describe('Admin payments endpoints', () => {
  test('GET /api/admin/payments returns payments list for admin', async () => {
    const res = await request(app)
      .get('/api/admin/payments')
      .set('user-id', 'admin-1')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe('pay-1');
    expect(res.body[0].job).toBeTruthy();
    expect(res.body[0].user).toBeTruthy();
  });

  test('POST /api/admin/payments/:id/reapply reapplies and features job', async () => {
    const res = await request(app)
      .post('/api/admin/payments/pay-1/reapply')
      .set('user-id', 'admin-1')
      .expect(200);

    expect(res.body.message).toMatch(/reapplied/i);
    expect(res.body.job).toBeTruthy();
  });

  test('PUT /api/admin/payments/:id/audit sets receiptSent and ownerNotified', async () => {
    // Mark receipt sent
    const res1 = await request(app)
      .put('/api/admin/payments/pay-1/audit')
      .set('user-id', 'admin-1')
      .send({ receiptSent: true })
      .expect(200);

    expect(res1.body.receiptSent).toBe(true);

    // Mark owner notified
    const res2 = await request(app)
      .put('/api/admin/payments/pay-1/audit')
      .set('user-id', 'admin-1')
      .send({ ownerNotified: true })
      .expect(200);

    expect(res2.body.ownerNotified).toBe(true);
  });
});
