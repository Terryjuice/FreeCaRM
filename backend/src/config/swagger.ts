export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FreeCaRM API',
    version: '1.0.0',
    description: 'AI-powered vehicle inspection and damage assessment API',
    contact: {
      name: 'API Support',
      email: 'support@freecarm.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['user', 'inspector', 'admin'] },
          phoneNumber: { type: 'string' },
          company: { type: 'string' },
        },
      },
      VehicleInfo: {
        type: 'object',
        required: ['make', 'model', 'year'],
        properties: {
          vin: { type: 'string' },
          make: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'number' },
          licensePlate: { type: 'string' },
          mileage: { type: 'number' },
          color: { type: 'string' },
        },
      },
      Inspection: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          vehicleInfo: { $ref: '#/components/schemas/VehicleInfo' },
          status: {
            type: 'string',
            enum: ['draft', 'in_progress', 'analyzing', 'completed', 'cancelled'],
          },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                angle: { type: 'string' },
                url: { type: 'string' },
                uploadedAt: { type: 'string', format: 'date-time' },
                analyzed: { type: 'boolean' },
              },
            },
          },
          damages: { type: 'array', items: { type: 'string' } },
          totalEstimatedCost: { type: 'number' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Damage: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          inspectionId: { type: 'string' },
          type: {
            type: 'string',
            enum: ['scratch', 'dent', 'crack', 'paint_damage', 'broken_part', 'rust', 'other'],
          },
          severity: { type: 'string', enum: ['minor', 'moderate', 'severe'] },
          location: {
            type: 'object',
            properties: {
              part: { type: 'string' },
              side: {
                type: 'string',
                enum: ['front', 'rear', 'left', 'right', 'top', 'interior'],
              },
            },
          },
          imageUrl: { type: 'string' },
          confidence: { type: 'number' },
          estimatedCost: {
            type: 'object',
            properties: {
              labor: { type: 'number' },
              parts: { type: 'number' },
              total: { type: 'number' },
            },
          },
          aiDetected: { type: 'boolean' },
          verified: { type: 'boolean' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Inspections', description: 'Vehicle inspection management' },
    { name: 'Damages', description: 'Damage detection and management' },
    { name: 'Reports', description: 'Report generation' },
    { name: 'Users', description: 'User management' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phoneNumber: { type: 'string' },
                  company: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/inspections': {
      post: {
        tags: ['Inspections'],
        summary: 'Create a new inspection',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleInfo'],
                properties: {
                  vehicleInfo: { $ref: '#/components/schemas/VehicleInfo' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Inspection created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    inspection: { $ref: '#/components/schemas/Inspection' },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Inspections'],
        summary: 'Get all inspections for current user',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 20 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'number', default: 0 },
          },
        ],
        responses: {
          200: {
            description: 'List of inspections',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    inspections: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Inspection' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        limit: { type: 'number' },
                        offset: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
