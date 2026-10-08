const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Complaint = require('../src/models/Complaint');
const SLA = require('../src/models/SLA');

let studentToken = '';
let adminToken = '';
let staffToken = '';
let testCategoryId = '';
let testComplaintId = '';

describe('ResolveIT API Integration Test Suite', () => {
  beforeAll(async () => {
    // Connect to test MongoDB database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/resolveit_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({});
    await Category.deleteMany({});
    await Complaint.deleteMany({});
    await SLA.deleteMany({});

    // Seed SLA default
    await SLA.create({ priority: 'MEDIUM', resolutionHours: 48 });

    // Seed Category
    const category = await Category.create({ name: 'Test Category', description: 'Testing category' });
    testCategoryId = category._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /health - Should return HTTP 200 with system status UP', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('UP');
    });

    it('GET /health/live - Should return ALIVE', async () => {
      const res = await request(app).get('/health/live');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('ALIVE');
    });
  });

  describe('2. Authentication APIs', () => {
    it('POST /api/auth/register - Should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'teststudent@resolveit.com',
          password: 'Password@123',
          department: 'Computer Science'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      studentToken = res.body.data.token;
    });

    it('POST /api/auth/login - Should authenticate registered user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teststudent@resolveit.com',
          password: 'Password@123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toEqual('teststudent@resolveit.com');
    });

    it('Seed Admin and Staff accounts for testing', async () => {
      const admin = await User.create({
        name: 'Test Admin',
        email: 'testadmin@resolveit.com',
        password: 'Password@123',
        role: 'ADMIN'
      });

      const staff = await User.create({
        name: 'Test Staff',
        email: 'teststaff@resolveit.com',
        password: 'Password@123',
        role: 'STAFF'
      });

      const adminRes = await request(app).post('/api/auth/login').send({ email: 'testadmin@resolveit.com', password: 'Password@123' });
      adminToken = adminRes.body.data.token;

      const staffRes = await request(app).post('/api/auth/login').send({ email: 'teststaff@resolveit.com', password: 'Password@123' });
      staffToken = staffRes.body.data.token;
    });
  });

  describe('3. Complaint Lifecycle & Workflows', () => {
    it('POST /api/complaints - User creates a complaint', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Air Conditioner Not Cooling in Lab 1',
          description: 'AC unit #2 is emitting warm air during peak afternoon hours.',
          categoryId: testCategoryId,
          priority: 'MEDIUM'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.complaintId).toMatch(/^CMP-2026-\d{4}$/);
      expect(res.body.data.status).toEqual('NEW');
      testComplaintId = res.body.data._id;
    });

    it('GET /api/complaints - User gets own complaints', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('PUT /api/complaints/:id/status - Staff updates status to IN_PROGRESS', async () => {
      // First staff updates status
      const res = await request(app)
        .put(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'ASSIGNED',
          note: 'Assigned for inspection'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toEqual('ASSIGNED');
    });

    it('PUT /api/complaints/:id/status - Staff marks complaint as RESOLVED', async () => {
      await request(app)
        .put(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'IN_PROGRESS', note: 'Working on AC unit' });

      const res = await request(app)
        .put(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'RESOLVED', note: 'Replaced AC compressor capacitor' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toEqual('RESOLVED');
    });

    it('POST /api/complaints/:id/rate - User rates the resolution', async () => {
      const res = await request(app)
        .post(`/api/complaints/${testComplaintId}/rate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          score: 5,
          feedback: 'Excellent response time and clean repair work!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.score).toEqual(5);
    });
  });

  describe('4. Metrics & Documentation Endpoints', () => {
    it('GET /metrics - Prometheus metrics endpoint should return text metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('resolveit_http_requests_total');
    });
  });
});
