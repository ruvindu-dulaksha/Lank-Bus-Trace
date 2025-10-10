import crypto from 'crypto';

/**
 * Middleware to add ETag support for conditional GET requests
 * Helps with caching and reduces bandwidth usage
 */
export const addETag = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Only add ETag for successful GET requests
    if (req.method === 'GET' && res.statusCode === 200) {
      const etag = generateETag(data);
      res.set('ETag', etag);
      
      // Check if client has matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        return res.status(304).end();
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware to add Last-Modified header support
 */
export const addLastModified = (field = 'updatedAt') => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only add Last-Modified for successful GET requests
      if (req.method === 'GET' && res.statusCode === 200 && data.data) {
        let lastModified;
        
        if (Array.isArray(data.data) && data.data.length > 0) {
          // For arrays, find the most recent modification
          const dates = data.data
            .map(item => item[field])
            .filter(date => date)
            .map(date => new Date(date));
          
          if (dates.length > 0) {
            lastModified = new Date(Math.max(...dates));
          }
        } else if (data.data[field]) {
          // For single objects
          lastModified = new Date(data.data[field]);
        }
        
        if (lastModified) {
          res.set('Last-Modified', lastModified.toUTCString());
          
          // Check if client has newer version
          const clientLastModified = req.headers['if-modified-since'];
          if (clientLastModified && new Date(clientLastModified) >= lastModified) {
            return res.status(304).end();
          }
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Generate ETag hash from response data
 */
function generateETag(data) {
  const hash = crypto.createHash('md5');
  hash.update(typeof data === 'string' ? data : JSON.stringify(data));
  return `"${hash.digest('hex')}"`;
}

/**
 * Cache control middleware for different types of data
 */
export const setCacheControl = (maxAge = 300, type = 'public') => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `${type}, max-age=${maxAge}`);
    }
    next();
  };
};

/**
 * Conditional GET middleware that checks both ETag and Last-Modified
 */
export const conditionalGET = (req, res, next) => {
  // Add conditional GET headers to response
  addETag(req, res, () => {
    addLastModified()(req, res, next);
  });
};