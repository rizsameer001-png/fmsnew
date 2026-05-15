const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const recreateAdmin = async () => {
  console.log('\n=================================');
  console.log('🔄 RECREATING ADMIN USER');
  console.log('=================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('../models/User.model');

    // Delete existing admin
    const deleted = await User.deleteMany({ email: 'admin@fms.com' });
    console.log(`🗑️ Deleted ${deleted.deletedCount} admin user(s)\n`);

    // Create new admin with correct password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const adminData = {
      name: 'Super Admin',
      email: 'admin@fms.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'super_admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      department: 'Administration',
      shift: { start: '09:00', end: '17:00' },
      address: {
        street: 'Admin Office',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    };
    
    const admin = await User.create(adminData);
    console.log('✅ Admin user recreated successfully!\n');

    // Verify
    const verifyAdmin = await User.findOne({ email: 'admin@fms.com' }).select('+password');
    const isValid = await bcrypt.compare('Admin@123', verifyAdmin.password);
    
    console.log(`Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: Admin@123`);
    console.log(`👤 Role: ${admin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

recreateAdmin();