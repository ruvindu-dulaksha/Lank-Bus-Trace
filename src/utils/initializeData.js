import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from '../config/logger.js';

/**
 * Create default admin user if none exists
 */
export const createDefaultAdmin = async () => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      logger.info('✅ Default admin user already exists');
      return existingAdmin;
    }
    
    // Create default admin user
    const defaultAdmin = {
      username: 'admin',
      email: 'admin@sltb.lk',
      password: 'Admin@123',
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+94771234567'
      },
      isActive: true
    };
    
    const adminUser = new User(defaultAdmin);
    await adminUser.save();
    
    logger.info('✅ Default admin user created successfully');
    logger.info(`📧 Admin Email: ${defaultAdmin.email}`);
    logger.info(`🔐 Admin Password: ${defaultAdmin.password}`);
    
    return adminUser;
    
  } catch (error) {
    if (error.code === 11000) {
      logger.warn('⚠️ Admin user with this email/username already exists');
      return await User.findOne({ $or: [{ email: 'admin@sltb.lk' }, { username: 'admin' }] });
    }
    logger.error('❌ Error creating default admin user:', error);
    throw error;
  }
};

/**
 * Create default test users for development
 */
export const createTestUsers = async () => {
  try {
    const testUsers = [
      {
        username: 'testdriver',
        email: 'driver@test.com',
        password: 'Driver@123',
        role: 'driver',
        profile: {
          firstName: 'Test',
          lastName: 'Driver',
          phone: '+94771234568'
        },
        driverDetails: {
          licenseNumber: 'DL123456789',
          licenseClass: 'D',
          licenseExpiry: new Date('2026-12-31'),
          experienceYears: 5,
          conductorInfo: {
            isConductor: true,
            employeeId: 'COND001',
            cashHandlingCertExpiry: new Date('2025-12-31')
          }
        }
      },
      {
        username: 'testoperator',
        email: 'operator@test.com',
        password: 'Operator@123',
        role: 'operator',
        profile: {
          firstName: 'Test',
          lastName: 'Operator',
          phone: '+94771234569'
        },
        operatorDetails: {
          licenseNumber: 'OP123456789',
          companyName: 'Test Transport Company',
          ntcRegistrationNumber: 'NTC123456'
        }
      }
    ];
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        logger.info(`✅ Created test user: ${userData.username} (${userData.role})`);
      }
    }
    
  } catch (error) {
    logger.error('❌ Error creating test users:', error);
  }
};

/**
 * Initialize default data
 */
export const initializeDefaultData = async () => {
  try {
    logger.info('🚀 Initializing default data...');
    
    // Wait for database connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.on('connected', resolve);
      });
    }
    
    // Create default admin
    await createDefaultAdmin();
    
    // Create test users in development
    if (process.env.NODE_ENV === 'development') {
      await createTestUsers();
    }
    
    logger.info('✅ Default data initialization completed');
    
  } catch (error) {
    logger.error('❌ Error initializing default data:', error);
  }
};

export default {
  createDefaultAdmin,
  createTestUsers,
  initializeDefaultData
};