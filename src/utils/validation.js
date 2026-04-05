const { ValidationError } = require('./errors');

/**
 * Validation utilities for input validation
 */

const validators = {
  /**
   * Validate user input for user creation/update
   */
  validateUser: (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
      if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
        errors.push('Username must be at least 3 characters');
      }
      if (!data.email || !isValidEmail(data.email)) {
        errors.push('Valid email is required');
      }
      if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
    }

    if (data.role && !['viewer', 'analyst', 'admin'].includes(data.role)) {
      errors.push('Role must be one of: viewer, analyst, admin');
    }

    if (data.status && !['active', 'inactive'].includes(data.status)) {
      errors.push('Status must be either active or inactive');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    return true;
  },

  /**
   * Validate financial record input
   */
  validateFinancialRecord: (data) => {
    const errors = [];

    if (data.amount === undefined || data.amount === null) {
      errors.push('Amount is required');
    } else if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.push('Type must be either income or expense');
    }

    if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (!data.record_date || !isValidDate(data.record_date)) {
      errors.push('Valid record_date is required (YYYY-MM-DD format)');
    }

    if (data.description && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    return true;
  },

  /**
   * Validate date range for filtering
   */
  validateDateRange: (startDate, endDate) => {
    if (startDate && !isValidDate(startDate)) {
      throw new ValidationError('Invalid startDate format. Use YYYY-MM-DD');
    }
    if (endDate && !isValidDate(endDate)) {
      throw new ValidationError('Invalid endDate format. Use YYYY-MM-DD');
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new ValidationError('startDate cannot be after endDate');
    }
    return true;
  }
};

/**
 * Helper functions
 */

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

module.exports = validators;
