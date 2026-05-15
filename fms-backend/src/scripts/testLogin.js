const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@fms.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found! Creating one...');
      
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const newAdmin = await User.create({
        name: 'Super Admin',
        email: 'admin@fms.com',
        phone: '9999999999',
        password: hashedPassword,
        role: 'super_admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
      });
      console.log('✅ Admin created successfully!');
      console.log('Email: admin@fms.com');
      console.log('Password: Admin@123\n');
    } else {
      console.log('✅ Admin found');
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
      console.log('Has password hash:', !!admin.password);
      console.log('Is Active:', admin.isActive);
      console.log('Password hash preview:', admin.password?.substring(0, 20) + '...\n');
    }

    // Test login with the admin we have
    const user = await User.findOne({ email: 'admin@fms.com' }).select('+password');
    
    if (user) {
      console.log('Testing password comparison...');
      const testPassword = 'Admin@123';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('bcrypt.compare result:', isMatch);
      
      if (isMatch) {
        console.log('✅ Password is correct! Login should work.');
      } else {
        console.log('❌ Password mismatch! Resetting password...');
        user.password = 'Admin@123';
        await user.save();
        console.log('✅ Password reset! Try login again.');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();