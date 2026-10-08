const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ResolveIT – Complaint Management System API',
    version: '1.0.0',
    description: 'REST API documentation for ResolveIT system supporting Users, Staff, Admins, Complaints, SLAs, and DevOps Monitoring.',
    contact: {
      name: 'ResolveIT DevOps Team',
      email: 'support@resolveit.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    },
    {
      url: '/api',
      description: 'Production Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'STAFF', 'ADMIN'] },
          department: { type: 'string' },
          phone: { type: 'string' }
        }
      },
      Complaint: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          complaintId: { type: 'string', example: 'CMP-2026-0001' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          status: { type: 'string', enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'ON_HOLD', 'REOPENED'] },
          slaDeadline: { type: 'string', format: 'date-time' },
          isBreached: { type: 'boolean' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Check API Service Health',
        responses: {
          200: { description: 'System healthy' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'User / Staff / Admin Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'student@resolveit.com' },
                  password: { type: 'string', example: 'Student@123456' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Authenticated successfully' }
        }
      }
    },
    '/api/complaints': {
      get: {
        summary: 'Get Complaints (Filtered & Paginated)',
        responses: {
          200: { description: 'List of complaints' }
        }
      },
      post: {
        summary: 'Create a new Complaint',
        responses: {
          201: { description: 'Complaint created' }
        }
      }
    }
  }
};

module.exports = { swaggerUi, swaggerDocument };
