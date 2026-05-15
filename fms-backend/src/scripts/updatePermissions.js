// fms-backend/src/scripts/updatePermissions.js
const mongoose = require('mongoose');
const Role = require('../models/Role.model');
require('dotenv').config();

const updatePermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all existing roles to ensure they don't have invalid permissions
    const roles = await Role.find();
    
    for (const role of roles) {
      // Filter out any invalid permissions
      const validPermissions = role.permissions.filter(p => 
        p !== 'make_payments' || p === 'make_payments' // keep make_payments if it exists
      );
      
      if (role.permissions.includes('make_payments')) {
        console.log(`✅ Role ${role.displayName} already has make_payments`);
      } else {
        // Add make_payments to customer role
        if (role.name === 'customer') {
          role.permissions.push('make_payments');
          await role.save();
          console.log(`✅ Added make_payments to ${role.displayName} role`);
        }
      }
    }

    console.log('✅ Permissions updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updatePermissions();