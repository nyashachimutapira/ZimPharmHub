const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const User = require('../models-sequelize/User');
const Job = require('../models-sequelize/Job');
const Payment = require('../models-sequelize/Payment');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test('webhook processes checkout.session.completed and features job', async () => {
  const user = await User.create({ firstName: 'Pay', lastName: 'Owner', email: 'pay@example.com', password: 'password', userType: 'pharmacy', locale: 'sn' });
  const job = await Job.create({ title: 'Pay Job', description: 'Needs feature', position: 'Other', pharmacyId: user.id, status: 'active' });

  const body = {
    type: 'checkout.session.completed',
    data: {
      object: {
        metadata: { jobId: job.id, days: '2', userId: user.id },
        amount_total: 1000,
        currency: 'usd',
        id: 'sess_test',
        customer_details: { email: 'pay@example.com' }
      }
    }
  };

  // Mock mailer and its template methods
  jest.mock('../utils/mailer', () => ({
    sendReceiptEmail: jest.fn().mockResolvedValue(true),
    sendOwnerNotification: jest.fn().mockResolvedValue(true)
  }));
  const { sendReceiptEmail, sendOwnerNotification } = require('../utils/mailer');

  const res = await request(app)
    .post('/api/payments/webhook')
    .set('Content-Type', 'application/json')
    .send(body)
    .expect(200);

  const updated = await Job.findByPk(job.id);
  expect(updated.featured).toBe(true);
  expect(updated.featuredUntil).toBeTruthy();

  const payments = await Payment.findAll({ where: { jobId: job.id } });
  expect(payments.length).toBeGreaterThan(0);
  const p = payments[0];
  expect(p.receiptSent).toBe(true);
  expect(p.ownerNotified).toBe(true);
  expect(p.receiptEmail).toBe('pay@example.com');

  // confirm a receipt email and owner notification were attempted
  expect(sendReceiptEmail).toHaveBeenCalled();
  expect(sendOwnerNotification).toHaveBeenCalled();

  // verify owner notification used owner's locale
  const ownerCall = sendOwnerNotification.mock.calls.find(c => c && c[0] && c[0].ownerEmail === user.email);
  expect(ownerCall).toBeTruthy();
  expect(ownerCall[0].locale).toBe('sn');
});