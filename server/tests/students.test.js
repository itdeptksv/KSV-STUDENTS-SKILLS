require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ksv_test_students';
const TIMEOUT = 30000;

let adminToken, classId, yearId, mongoAvailable = false;

beforeAll(async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    mongoAvailable = true;
    await User.deleteMany({});
    await Student.deleteMany({});
    await Class.deleteMany({});
    await AcademicYear.deleteMany({});
    await User.create({ name: 'Admin', email: 'admin@test.com', password: 'TestPass123!', role: 'admin' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'TestPass123!' });
    adminToken = login.body.data?.accessToken;
    const cls = await Class.create({ name: 'Class 5', shortName: 'C5', classGroup: 'Classes 3–5', order: 7, sections: [{ name: 'A' }] });
    classId = cls._id.toString();
    const year = await AcademicYear.create({ label: '2024-25', startDate: new Date('2024-06-01'), endDate: new Date('2025-03-31'), isCurrent: true });
    yearId = year._id.toString();
  } catch {
    console.warn('MongoDB not available — skipping student tests');
  }
}, TIMEOUT);

afterAll(async () => {
  if (mongoAvailable) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('Student CRUD', () => {
  let studentId;

  test('Create student', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Student', admissionNumber: 'ADM001', class: classId, section: 'A', academicYear: yearId });
    expect(res.status).toBe(201);
    expect(res.body.data.admissionNumber).toBe('ADM001');
    studentId = res.body.data._id;
  }, TIMEOUT);

  test('Duplicate admission number rejected', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Another', admissionNumber: 'ADM001', class: classId, section: 'A', academicYear: yearId });
    expect(res.status).toBe(409);
  }, TIMEOUT);

  test('List students', async () => {
    if (!mongoAvailable) return;
    const res = await request(app).get('/api/v1/students').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  }, TIMEOUT);

  test('Get student by ID', async () => {
    if (!mongoAvailable || !studentId) return;
    const res = await request(app).get(`/api/v1/students/${studentId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Student');
  }, TIMEOUT);

  test('Update student', async () => {
    if (!mongoAvailable || !studentId) return;
    const res = await request(app).put(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Student', admissionNumber: 'ADM001', class: classId, section: 'B', academicYear: yearId });
    expect(res.status).toBe(200);
    expect(res.body.data.section).toBe('B');
  }, TIMEOUT);

  test('Unauthenticated cannot list students', async () => {
    const res = await request(app).get('/api/v1/students');
    expect(res.status).toBe(401);
  });
});
