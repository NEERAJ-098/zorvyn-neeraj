const User = require('../models/user');
const { AuthorizationError } = require('../utils/errors');

/**
 * User Controller - Handles user management business logic
 */

const userController = {
  /**
   * Create a new user (Admin only)
   */
  createUser: async (req, res, next) => {
    try {
      const user = await User.create(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (req, res, next) => {
    try {
      const user = await User.getById(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user by ID (Admin only or own user)
   */
  getUserById: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);

      // Users can only view their own data unless admin
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        throw new AuthorizationError('You can only view your own user data');
      }

      const user = await User.getById(userId);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all users (Admin only)
   */
  getAllUsers: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const users = await User.getAll(limit, offset);
      const count = await User.count();

      res.json({
        success: true,
        data: users,
        pagination: {
          total: count,
          limit,
          offset,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user (Admin can update anyone, users can update themselves)
   */
  updateUser: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);

      // Users can only update their own data unless admin
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        throw new AuthorizationError('You can only update your own user data');
      }

      // Non-admin users cannot change their own role
      if (req.user.role !== 'admin' && req.body.role !== undefined) {
        throw new AuthorizationError('You cannot change your own role');
      }

      const user = await User.update(userId, req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);

      // Cannot delete yourself
      if (req.user.id === userId) {
        throw new AuthorizationError('You cannot delete your own account');
      }

      const result = await User.deleteUser(userId);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
