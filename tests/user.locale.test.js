const request = require('supertest');
const app = require('../server');

jest.mock('../models-sequelize/User', () => ({
  update: jest.fn().mockImplementation((updates, opts) => Promise.resolve([1, [{ id: opts.where.id, ...updates }]]))
}));

describe('User locale update', () => {
  test('PUT /api/users/:id updates locale', async () => {
    const res = await request(app)
      .put('/api/users/user-1')
      .send({ locale: 'fr' })
      .expect(200);

    expect(res.body.locale).toBe('fr');
    expect(res.body.id).toBe('user-1');
  });
});