import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AutoMotion - Live Operations API',
    version: '1.0.0',
    description: `
### AutoMotion Vehicle Service Operations Dashboard API
This REST API powers the live operations hub for dispatchers, technicians, and operations executives.

#### Features:
- 📊 **Real-time KPI & Telemetry Analytics**
- 🚗 **Live Vehicle Service Booking Management**
- 👨‍🔧 **Mechanic Fleet & Dispatch Status**
- ⚡ **WebSocket Events for Real-Time State Transitions**
- 🧪 **Live Simulation Engine**
    `,
    contact: {
      name: 'AutoMotion Engineering',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API base path',
    },
  ],
  tags: [
    { name: 'System', description: 'System health & diagnostic endpoints' },
    { name: 'Dashboard', description: 'Real-time KPI overview and charts analytics' },
    { name: 'Bookings', description: 'Vehicle service booking CRUD and status lifecycle transitions' },
    { name: 'Mechanics', description: 'Mechanic fleet tracking, ratings, and workload' },
    { name: 'Customers', description: 'Customer directory and history' },
    { name: 'Services', description: 'Automotive service catalog and pricing' },
    { name: 'Simulation', description: 'Live automated lifecycle transition simulation engine' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'API Health Check',
        responses: {
          200: { description: 'API is running and healthy' },
        },
      },
    },
    '/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get Overview KPI statistics',
        description: 'Returns total bookings, revenue, pending/in-progress/completed counts, and active mechanics.',
        responses: {
          200: { description: 'Overview statistics' },
        },
      },
    },
    '/dashboard/analytics': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get Chart Analytics',
        description: 'Returns time series revenue/bookings, status distribution, and service category breakdown.',
        parameters: [
          { name: 'days', in: 'query', schema: { type: 'integer', default: 30 }, description: 'Number of past days to aggregate' },
        ],
        responses: {
          200: { description: 'Analytics data object for visual charts' },
        },
      },
    },
    '/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List and filter bookings',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Paginated list of bookings' },
        },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create a new vehicle service booking',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customerId', 'serviceId', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'licensePlate', 'customerAddress'],
                properties: {
                  customerId: { type: 'string', format: 'uuid' },
                  serviceId: { type: 'string', format: 'uuid' },
                  mechanicId: { type: 'string', format: 'uuid' },
                  vehicleMake: { type: 'string', example: 'Toyota' },
                  vehicleModel: { type: 'string', example: 'Camry' },
                  vehicleYear: { type: 'integer', example: 2023 },
                  licensePlate: { type: 'string', example: 'CA-8XYZ90' },
                  customerAddress: { type: 'string', example: '742 Evergreen Terrace, San Francisco, CA' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'], default: 'MEDIUM' },
                  notes: { type: 'string', example: 'Customer reported squeaking noise when braking.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created successfully' },
        },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get single booking by ID with audit log history',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Booking detail object' },
          404: { description: 'Booking not found' },
        },
      },
    },
    '/bookings/{id}/status': {
      patch: {
        tags: ['Bookings'],
        summary: 'Update booking status (triggers real-time WebSocket broadcast)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
                  mechanicId: { type: 'string', format: 'uuid' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated and broadcasted' },
        },
      },
    },
    '/mechanics': {
      get: {
        tags: ['Mechanics'],
        summary: 'Get all mechanics with live status and active assignments',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['AVAILABLE', 'BUSY', 'OFF_DUTY'] } },
        ],
        responses: {
          200: { description: 'List of mechanics' },
        },
      },
    },
    '/mechanics/{id}': {
      get: {
        tags: ['Mechanics'],
        summary: 'Get mechanic profile and job history',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Mechanic detail' },
        },
      },
    },
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'Get customers with total spend and bookings count',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of customers' },
        },
      },
    },
    '/services': {
      get: {
        tags: ['Services'],
        summary: 'Get automotive service catalog and base prices',
        responses: {
          200: { description: 'List of services' },
        },
      },
    },
    '/simulation/status': {
      get: {
        tags: ['Simulation'],
        summary: 'Get simulation engine running status',
        responses: {
          200: { description: 'Current simulation state' },
        },
      },
    },
    '/simulation/start': {
      post: {
        tags: ['Simulation'],
        summary: 'Start live automated lifecycle simulation',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  intervalMs: { type: 'integer', default: 6000, description: 'Step interval in milliseconds' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Simulation started' },
        },
      },
    },
    '/simulation/stop': {
      post: {
        tags: ['Simulation'],
        summary: 'Stop live simulation',
        responses: {
          200: { description: 'Simulation stopped' },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Instant Mechanic - API Docs',
  }));
}
