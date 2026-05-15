const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const resetAdminPassword = async () => {
  console.log('\n=================================');
  console.log('🔐 RESETTING ADMIN PASSWORD');
  console.log('=================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('../models/User.model');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@fms.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('📋 Current Admin Details:');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);

    // Hash new password
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Password updated successfully!\n');

    // Verify the new password
    const verifyAdmin = await User.findOne({ email: 'admin@fms.com' }).select('+password');
    const isValid = await bcrypt.compare(newPassword, verifyAdmin.password);
    
    console.log(`Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@fms.com');
    console.log('🔑 Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();