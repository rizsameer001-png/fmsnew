// src/scripts/cleanAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User.model');
require('dotenv').config();

const cleanAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Delete the corrupted admin
    const result = await User.deleteOne({ email: 'admin@fms.com' });
    console.log(`Deleted ${result.deletedCount} admin user(s)`);
    
    console.log('✅ Corrupted admin removed. Now run: npm run seed:admin');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanAdmin();