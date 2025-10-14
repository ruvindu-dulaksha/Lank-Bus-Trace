/**
 * Sanitize response data for public endpoints by removing sensitive fields
 * @param {Object|Array} data - The data to sanitize
 * @param {Array} fieldsToRemove - Fields to remove from the response
 * @param {Set} visited - Set to track visited objects to prevent circular references
 * @returns {Object|Array} Sanitized data
 */
export const sanitizePublicResponse = (data, fieldsToRemove = ['_id', '__v', 'id'], visited = new Set()) => {
  if (!data) return data;

  // Handle Mongoose documents by converting to plain object first
  if (data.toObject && typeof data.toObject === 'function') {
    data = data.toObject();
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizePublicResponse(item, fieldsToRemove, visited));
  }

  if (typeof data === 'object' && data !== null) {
    // Check for circular reference
    if (visited.has(data)) {
      return '[Circular]';
    }
    visited.add(data);

    const sanitized = {};

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Remove sensitive fields
        if (!fieldsToRemove.includes(key)) {
          const value = data[key];
          if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizePublicResponse(value, fieldsToRemove, visited);
          } else {
            sanitized[key] = value;
          }
        }
      }
    }

    visited.delete(data);
    return sanitized;
  }

  return data;
};

/**
 * Check if the request is from an authenticated admin or operator
 * @param {Object} req - Express request object
 * @returns {boolean} True if user is admin or operator
 */
export const isAdminOrOperator = (req) => {
  return req.user && (req.user.role === 'admin' || req.user.role === 'operator');
};