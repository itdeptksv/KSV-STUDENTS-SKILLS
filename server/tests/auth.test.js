require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ksv_test';
const TIMEOUT = 30000;

let mongoAvailable = false;

beforeAll(async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    mongoAvailable = true;
  } catch {
    console.warn('MongoDB not available — skipping DB tests');
  }
}, TIMEOUT);

afterAll(async () => {
  if (mongoAvailable) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('Health check', () => {
  test('GET /api/v1/health returns 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth API', () => {
  const adminData = { name: 'Test Admin', email: 'admin@test.com', password: 'TestPass123!' };

  beforeAll(async () => {
    if (!mongoAvailable) return;
    await User.deleteMany({});
    await User.create({ ...adminData, role: 'admin' });
  }, TIMEOUT);

  test('POST /api/v1/auth/login — valid credentials', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).post('/api/v1/auth/login').send({ email: adminData.email, password: adminData.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  }, TIMEOUT);

  test('POST /api/v1/auth/login — invalid password returns 401', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).post('/api/v1/auth/login').send({ email: adminData.email, password: 'wrong' });
    expect(res.status).toBe(401);
  }, TIMEOUT);

  test('POST /api/v1/auth/login — missing fields returns 400', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: adminData.email });
    expect(res.status).toBe(400);
  });

  test('GET /api/v1/auth/me — no token returns 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/auth/me — valid token', async () => {
    if (!mongoAvailable) return;
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: adminData.email, password: adminData.password });
    const token = loginRes.body.data.accessToken;
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(adminData.email);
  }, TIMEOUT);
});

describe('Role-based access control', () => {
  let adminToken, teacherToken;

  beforeAll(async () => {
    if (!mongoAvailable) return;
    await User.deleteMany({});
    await User.create({ name: 'Admin', email: 'admin2@test.com', password: 'TestPass123!', role: 'admin' });
    await User.create({ name: 'Teacher', email: 'teacher@test.com', password: 'TestPass123!', role: 'class_teacher' });
    const a = await request(app).post('/api/v1/auth/login').send({ email: 'admin2@test.com', password: 'TestPass123!' });
    adminToken = a.body.data?.accessToken;
    const t = await request(app).post('/api/v1/auth/login').send({ email: 'teacher@test.com', password: 'TestPass123!' });
    teacherToken = t.body.data?.accessToken;
  }, TIMEOUT);

  test('Admin can list users', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  }, TIMEOUT);

  test('Teacher cannot list users — returns 403', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(403);
  }, TIMEOUT);

  test('Unauthenticated cannot access users — returns 401', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });

  test('Teacher cannot create admin user — returns 403', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).post('/api/v1/users')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Hacker', email: 'hacker@test.com', password: 'pass', role: 'admin' });
    expect(res.status).toBe(403);
  }, TIMEOUT);
});
