const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Financial Management Backend API',
      version: '1.0.0',
      description: 'A comprehensive backend system for managing financial records with role-based access control',
      contact: {
        name: 'Backend Learning',
        url: 'http://localhost:3000'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'custom',
          description: 'Authorization header format: Bearer user:<id>:<username>:<role>:<status>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_analyst' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        FinancialRecord: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 2 },
            amount: { type: 'number', format: 'double', example: 100.50 },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string', example: 'Food' },
            description: { type: 'string', example: 'Grocery shopping' },
            record_date: { type: 'string', format: 'date', example: '2024-01-31' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        DashboardSummary: {
          type: 'object',
          properties: {
            total_income: { type: 'number', example: 5000 },
            total_expenses: { type: 'number', example: 1200 },
            net_balance: { type: 'number', example: 3800 },
            total_records: { type: 'integer', example: 10 }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/users.js',
    './src/routes/records.js', 
    './src/routes/dashboard.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
