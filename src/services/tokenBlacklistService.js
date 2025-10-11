/**
 * Token Blacklist Service
 * Handles JWT token invalidation for proper logout functionality
 */

import logger from '../config/logger.js';

class TokenBlacklistService {
  constructor() {
    // In-memory store for blacklisted tokens
    // In production, consider using Redis for persistence and scaling
    this.blacklistedTokens = new Set();
    
    // Cleanup interval for expired tokens (every hour)
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000); // 1 hour
    
    logger.info('Token Blacklist Service initialized');
  }

  /**
   * Add a token to the blacklist
   * @param {string} token - JWT token to blacklist
   * @param {number} expiresAt - Token expiration timestamp
   */
  blacklistToken(token, expiresAt) {
    if (!token) {
      logger.warn('Attempted to blacklist empty token');
      return false;
    }

    // Store token with its expiration time
    const tokenData = {
      token,
      expiresAt,
      blacklistedAt: Date.now()
    };

    this.blacklistedTokens.add(JSON.stringify(tokenData));
    
    logger.info(`Token blacklisted: ${token.substring(0, 20)}...`, {
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      blacklistedAt: new Date().toISOString()
    });

    return true;
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} - True if token is blacklisted
   */
  isTokenBlacklisted(token) {
    if (!token) return false;

    // Check if token exists in blacklist
    for (const tokenDataStr of this.blacklistedTokens) {
      try {
        const tokenData = JSON.parse(tokenDataStr);
        if (tokenData.token === token) {
          // Check if token has expired naturally
          if (tokenData.expiresAt && tokenData.expiresAt < Math.floor(Date.now() / 1000)) {
            // Token has expired, remove from blacklist
            this.blacklistedTokens.delete(tokenDataStr);
            return false;
          }
          return true;
        }
      } catch (error) {
        logger.error('Error parsing blacklisted token data:', error);
        // Remove corrupted entry
        this.blacklistedTokens.delete(tokenDataStr);
      }
    }

    return false;
  }

  /**
   * Remove expired tokens from blacklist
   */
  cleanupExpiredTokens() {
    const currentTime = Math.floor(Date.now() / 1000);
    let cleanedCount = 0;

    for (const tokenDataStr of this.blacklistedTokens) {
      try {
        const tokenData = JSON.parse(tokenDataStr);
        
        // Remove if token has expired
        if (tokenData.expiresAt && tokenData.expiresAt < currentTime) {
          this.blacklistedTokens.delete(tokenDataStr);
          cleanedCount++;
        }
      } catch (error) {
        // Remove corrupted entries
        this.blacklistedTokens.delete(tokenDataStr);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired tokens from blacklist`, {
        remainingTokens: this.blacklistedTokens.size
      });
    }
  }

  /**
   * Get blacklist statistics
   * @returns {object} - Blacklist statistics
   */
  getStats() {
    return {
      totalBlacklistedTokens: this.blacklistedTokens.size,
      lastCleanup: new Date().toISOString(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Clear all blacklisted tokens (for testing or emergency)
   */
  clearAll() {
    const count = this.blacklistedTokens.size;
    this.blacklistedTokens.clear();
    
    logger.warn(`Cleared all ${count} blacklisted tokens`, {
      action: 'clear_all_blacklist',
      timestamp: new Date().toISOString()
    });

    return count;
  }

  /**
   * Blacklist all tokens for a specific user (useful for account security)
   * @param {string} userId - User ID to blacklist all tokens for
   * @param {Array} userTokens - Array of user's active tokens
   */
  blacklistUserTokens(userId, userTokens = []) {
    let blacklistedCount = 0;

    userTokens.forEach(tokenData => {
      if (this.blacklistToken(tokenData.token, tokenData.expiresAt)) {
        blacklistedCount++;
      }
    });

    logger.info(`Blacklisted ${blacklistedCount} tokens for user ${userId}`, {
      userId,
      blacklistedCount,
      action: 'blacklist_user_tokens'
    });

    return blacklistedCount;
  }

  /**
   * Cleanup service on shutdown
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    logger.info('Token Blacklist Service shutdown completed', {
      finalTokenCount: this.blacklistedTokens.size
    });
  }
}

// Create singleton instance
const tokenBlacklistService = new TokenBlacklistService();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  tokenBlacklistService.shutdown();
});

process.on('SIGINT', () => {
  tokenBlacklistService.shutdown();
});

export default tokenBlacklistService;