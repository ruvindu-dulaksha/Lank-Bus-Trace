import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import connectDB from '../src/config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const createTestUsers = async () => {
  try {
    console.log('🔄 Creating test users...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin_ntc' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
    } else {
      // Create admin user
      const adminUser = new User({
        username: 'admin_ntc',
        email: 'admin@ntc.gov.lk',
        password: 'admin123', // This will be automatically hashed by the pre-save middleware
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+94112345678'
        },
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Admin user created: admin_ntc / admin123');
    }

    // Check if test operator exists
    const existingOperator = await User.findOne({ username: 'operator_test' });
    if (existingOperator) {
      console.log('❌ Operator user already exists');
    } else {
      // Create test operator
      const operatorUser = new User({
        username: 'operator_test',
        email: 'operator@ntc.gov.lk',
        password: 'operator123', // This will be automatically hashed
        role: 'operator',
        profile: {
          firstName: 'Test',
          lastName: 'Operator',
          phone: '+94112345679'
        },
        isActive: true
      });

      await operatorUser.save();
      console.log('✅ Operator user created: operator_test / operator123');
    }

    // Check if test commuter exists
    const existingCommuter = await User.findOne({ username: 'user_test' });
    if (existingCommuter) {
      console.log('❌ Commuter user already exists');
    } else {
      // Create test commuter
      const commuterUser = new User({
        username: 'user_test',
        email: 'user@example.com',
        password: 'user123', // This will be automatically hashed
        role: 'commuter',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          phone: '+94771234567'
        },
        isActive: true
      });

      await commuterUser.save();
      console.log('✅ Commuter user created: user_test / user123');
    }

    console.log('\n🎉 Test users creation completed!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin_ntc / admin123');
    console.log('Operator: operator_test / operator123');
    console.log('Commuter: user_test / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();