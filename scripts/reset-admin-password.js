import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import connectDB from '../src/config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const resetAdminPassword = async () => {
  try {
    console.log('🔄 Resetting admin password...');

    // Find the admin user
    const adminUser = await User.findOne({ username: 'admin_ntc' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating new admin user...');
      
      // Create new admin user
      const newAdmin = new User({
        username: 'admin_ntc',
        email: 'admin@ntc.gov.lk',
        password: 'admin123', // This will be automatically hashed by pre-save middleware
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+94112000000'
        },
        isActive: true
      });

      await newAdmin.save();
      console.log('✅ New admin user created: admin_ntc / admin123');
    } else {
      console.log('📝 Admin user found. Updating password...');
      
      // Update password (will trigger pre-save middleware to hash)
      adminUser.password = 'admin123';
      adminUser.loginAttempts = 0; // Reset login attempts
      adminUser.lockUntil = undefined; // Remove any account lock
      adminUser.isActive = true; // Ensure account is active
      
      await adminUser.save();
      console.log('✅ Admin password updated: admin_ntc / admin123');
    }

    // Verify the password works
    console.log('🔍 Verifying password...');
    const testUser = await User.findOne({ username: 'admin_ntc' }).select('+password');
    const isValid = await testUser.comparePassword('admin123');
    
    if (isValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
    }

    console.log('\n🎉 Admin password reset completed!');
    console.log('\n📝 Updated Credentials:');
    console.log('Username: admin_ntc');
    console.log('Password: admin123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();