const request = require('supertest');
const app = require('../server');

jest.mock('stripe', () => {
  return () => ({
    checkout: { sessions: { create: jest.fn().mockResolvedValue({ url: 'https://checkout.mock' }) } },
    paymentIntents: { create: jest.fn().mockResolvedValue({ client_secret: 'cs_test' }) },
    webhooks: { constructEvent: jest.fn() }
  });
});

describe('Payments routes', () => {
  test('create-feature-checkout returns a URL', async () => {
    const res = await request(app)
      .post('/api/payments/create-feature-checkout')
      .send({ jobId: 'job-123', days: 7, userId: 'user-123' })
      .expect(200);

    expect(res.body.url).toBeTruthy();
  });
});
