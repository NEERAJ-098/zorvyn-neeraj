const { AuthenticationError, AuthorizationError } = require('../utils/errors');

/**
 * Mock authentication system
 * In a real application, you would use JWT tokens or similar
 */

// In-memory store for authenticated users (in production, use sessions or JWT)
const authenticatedUsers = new Map();

/**
 * Authentication middleware
 * Extracts and validates user information from request header
 * Expected header format: Authorization: Bearer user:<user_id>:<username>:<role>:<status>
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Authorization header is missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid authorization header format');
    }

    const userData = parts[1].split(':');
    if (userData.length < 4 || userData[0] !== 'user') {
      throw new AuthenticationError('Invalid token format');
    }

    const [, userId, username, role, status] = userData;

    if (!userId || !username || !role || !status) {
      throw new AuthenticationError('Incomplete user data in token');
    }

    if (!['viewer', 'analyst', 'admin'].includes(role)) {
      throw new AuthenticationError('Invalid role');
    }

    if (!['active', 'inactive'].includes(status)) {
      throw new AuthenticationError('Invalid user status');
    }

    if (status === 'inactive') {
      throw new AuthenticationError('User account is inactive');
    }

    // Attach user to request
    req.user = {
      id: parseInt(userId),
      username,
      role,
      status
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(error.statusCode).json({
        error: error.name,
        message: error.message
      });
    }
    res.status(401).json({
      error: 'AuthenticationError',
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-based access control middleware factory
 * Usage: app.use(authorize('admin', 'analyst'))
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          `This action requires one of these roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(error.statusCode).json({
          error: error.name,
          message: error.message
        });
      }
      res.status(403).json({
        error: 'AuthorizationError',
        message: 'Not authorized to perform this action'
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize
};
