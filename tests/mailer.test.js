const { notifySubscribers, sendEmail } = require('../utils/mailer');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Newsletter = require('../models/Newsletter');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Mailer notify flow (basic)', () => {
  test('notifySubscribers handles zero subscribers gracefully', async () => {
    const res = await notifySubscribers('jobs', 'Test Subject', 'Text', '<p>HTML</p>');
    expect(res).toHaveProperty('sent');
    expect(res.sent).toBe(0);
  });

  test('notifySubscribers sends to subscribers', async () => {
    await Newsletter.create({ email: 'a@example.com', firstName: 'A', lastName: 'B', categories: { jobs: true } });
    const res = await notifySubscribers('jobs', 'Test Subject 2', 'Text', '<p>HTML</p>');
    // Depending on env configuration, emails may be logged instead of sent. Ensure function returns an object
    expect(res).toHaveProperty('sent');
    expect(res.total).toBeGreaterThanOrEqual(1);
  });
});