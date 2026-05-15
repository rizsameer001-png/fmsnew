// src/seeders/admin.seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

const seedAdmin = async () => {
  console.log('\n=================================');
  console.log('🔐 ADMIN USER CREATION');
  console.log('=================================\n');
  
  try {
    // Step 1: Check MongoDB URI
    console.log('Step 1: Checking MongoDB connection...');
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables!');
      console.log('💡 Please create a .env file with: MONGO_URI=your_connection_string\n');
      process.exit(1);
    }
    
    console.log('✅ MONGO_URI found');
    console.log(`📡 Connecting to: ${mongoUri.substring(0, 50)}...\n`);
    
    // Step 2: Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!\n');
    
    // Step 3: Check if users collection exists and count documents
    const userCount = await User.countDocuments();
    console.log(`Step 2: Found ${userCount} existing users in database\n`);
    
    // Step 4: Delete any existing admin
    console.log('Step 3: Removing any existing admin user...');
    const deleteResult = await User.deleteMany({ email: 'admin@fms.com' });
    console.log(`✅ Deleted ${deleteResult.deletedCount} admin user(s)\n`);
    
    // Step 5: Create new admin
    console.log('Step 4: Creating new admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    console.log('   Password hashed successfully');
    
    const adminData = {
      name: 'Super Admin',
      email: 'admin@fms.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'super_admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    };
    
    console.log('   Admin data prepared:', {
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      isActive: adminData.isActive
    });
    
    const admin = await User.create(adminData);
    console.log('✅ Admin user created successfully!\n');
    
    // Step 6: Verify the admin was created correctly
    console.log('Step 5: Verifying admin user...');
    const verifyAdmin = await User.findOne({ email: 'admin@fms.com' }).lean();
    
    if (verifyAdmin) {
      console.log('✅ Verification successful!');
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 ADMIN USER DETAILS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   ID: ${verifyAdmin._id}`);
      console.log(`   Name: ${verifyAdmin.name}`);
      console.log(`   Email: ${verifyAdmin.email}`);
      console.log(`   Phone: ${verifyAdmin.phone}`);
      console.log(`   Role: ${verifyAdmin.role}`);
      console.log(`   Is Active: ${verifyAdmin.isActive}`);
      console.log(`   Email Verified: ${verifyAdmin.isEmailVerified}`);
      console.log(`   Created: ${verifyAdmin.createdAt}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Step 7: Test password verification
      console.log('Step 6: Testing password verification...');
      const testPassword = 'Admin@123';
      const isPasswordValid = await bcrypt.compare(testPassword, verifyAdmin.password);
      console.log(`   Password "Admin@123" match: ${isPasswordValid ? '✅ YES' : '❌ NO'}\n`);
      
      if (!isPasswordValid) {
        console.error('⚠️ Warning: Password verification failed!');
      }
    } else {
      console.error('❌ Verification failed: Admin not found after creation!');
    }
    
    // Step 8: Final summary
    console.log('=================================');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('=================================');
    console.log('📧 Email: admin@fms.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: super_admin');
    console.log('=================================\n');
    
    console.log('🎉 Admin setup complete! You can now login.\n');
    
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n📋 Error Details:', error);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 TIP: Check your MongoDB username and password in the connection string');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 TIP: Check your internet connection or cluster name');
    }
    if (error.message.includes('createCollection') || error.message.includes('collection')) {
      console.log('\n💡 TIP: Check if you have write permissions on the database');
    }
    
    process.exit(1);
  }
};

seedAdmin();
