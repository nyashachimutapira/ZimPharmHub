const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const User = require('../models-sequelize/User');
const Job = require('../models-sequelize/Job');
const { updateExpiredJobs } = require('../utils/jobScheduler');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Jobs API', () => {
  test('POST /api/jobs creates job with featured and expiresAt', async () => {
    const user = await User.create({ firstName: 'Pharm', lastName: 'Owner', email: 'pharm@example.com', password: 'password', userType: 'pharmacy' });

    const payload = {
      title: 'Test Pharmacist',
      description: 'Test job',
      position: 'Pharmacist',
      salary: { min: 1000, max: 2000, currency: 'ZWL' },
      location: { city: 'Harare', province: 'Harare' },
      requirements: ['Registration', 'BPharm'],
      responsibilities: ['Dispensing', 'Counselling'],
      featured: true,
      featuredUntil: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString()
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('user-id', user.id)
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.featured).toBe(true);
    expect(res.body.featuredUntil).toBeTruthy();
    expect(res.body.expiresAt).toBeTruthy();
  });

  test('Job scheduler closes expired job', async () => {
    const user = await User.create({ firstName: 'Exp', lastName: 'Owner', email: 'exp@example.com', password: 'password', userType: 'pharmacy' });

    const past = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const job = await Job.create({
      title: 'Expired Job',
      description: 'Expired job',
      position: 'Other',
      pharmacyId: user.id,
      status: 'active',
      expiresAt: past
    });

    // Run scheduler
    await updateExpiredJobs();

    const updated = await Job.findByPk(job.id);
    expect(updated.status).toBe('closed');
  });

  test('Admin or owner can toggle featured', async () => {
    const owner = await User.create({ firstName: 'Own', lastName: 'Owner', email: 'own@example.com', password: 'password', userType: 'pharmacy' });
    const admin = await User.create({ firstName: 'Admin', lastName: 'User', email: 'admin2@example.com', password: 'password', userType: 'admin' });

    const job = await Job.create({
      title: 'Feature Test',
      description: 'Feature test job',
      position: 'Other',
      pharmacyId: owner.id,
      status: 'active'
    });

    // Owner sets featured
    await request(app)
      .put(`/api/jobs/${job.id}/feature`)
      .set('user-id', owner.id)
      .send({ featured: true, featuredUntil: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString() })
      .expect(200);

    const updated = await Job.findByPk(job.id);
    expect(updated.featured).toBe(true);

    // Admin can unfeature
    await request(app)
      .put(`/api/jobs/${job.id}/feature`)
      .set('user-id', admin.id)
      .send({ featured: false })
      .expect(200);

    const updated2 = await Job.findByPk(job.id);
    expect(updated2.featured).toBe(false);
  });
});
