require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { initializeDatabase } = require('./db/init');
const { AppError } = require('./utils/errors');

// Import routes
const userRoutes = require('./routes/users');
const recordRoutes = require('./routes/records');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui { padding: 20px; }',
  customSiteTitle: 'Financial Management API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
    filter: true,
    showRequestHeaders: true
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'Financial Management Backend API',
    version: '1.0.0',
    endpoints: {
      users: {
        'POST /api/users': 'Create user (Admin only)',
        'GET /api/users': 'Get all users (Admin only)',
        'GET /api/users/me': 'Get current user',
        'GET /api/users/:id': 'Get user by ID',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user (Admin only)'
      },
      records: {
        'POST /api/records': 'Create financial record (Analyst/Admin)',
        'GET /api/records': 'Get user records with filtering',
        'GET /api/records/:id': 'Get specific record',
        'PUT /api/records/:id': 'Update record (Analyst/Admin)',
        'DELETE /api/records/:id': 'Delete record (Analyst/Admin)'
      },
      dashboard: {
        'GET /api/dashboard': 'Get comprehensive dashboard data',
        'GET /api/dashboard/summary': 'Get financial summary',
        'GET /api/dashboard/categories': 'Get category breakdown',
        'GET /api/dashboard/recent': 'Get recent transactions'
      }
    },
    swagger_ui: 'http://localhost:' + PORT + '/api-docs',
    authentication: 'Use Authorization header: Bearer user:<id>:<username>:<role>:<status>',
    roles: ['viewer', 'analyst', 'admin'],
    status: ['active', 'inactive']
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFoundError',
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.name,
      message: error.message
    });
  }

  // Handle database errors
  if (error.message && error.message.includes('UNIQUE constraint')) {
    return res.status(409).json({
      error: 'ConflictError',
      message: 'Resource already exists'
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n✅ Backend server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🔍 Swagger UI: http://localhost:${PORT}/api-docs\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
