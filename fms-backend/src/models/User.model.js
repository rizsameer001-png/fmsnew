

// // src/models/User.model.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     index: true,
//   },
//   phone: {
//     type: String,
//     required: [true, 'Phone number is required'],
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: 6,
//     select: false,
//   },
//   role: {
//     type: String,
//     enum: ['super_admin', 'manager', 'supervisor', 'technician', 'customer'],
//     required: true,
//     default: 'customer',
//   },
//   technicianType: {
//     type: String,
//     enum: ['electrician', 'cleaner', 'security', 'plumbing', 'waste_management', 'landscaping', 'catering', 'reception', 'ppm_staff', null],
//     default: null,
//   },
//   profileImage: {
//     type: String,
//     default: null,
//   },
//   buildingId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Building',
//     default: null,
//   },
//   department: {
//     type: String,
//     trim: true,
//   },
//   shift: {
//     start: { type: String, default: '09:00' },
//     end: { type: String, default: '17:00' },
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
//   isEmailVerified: {
//     type: Boolean,
//     default: false,
//   },
//   isPhoneVerified: {
//     type: Boolean,
//     default: false,
//   },
//   fcmTokens: [{
//     type: String,
//   }],
//   lastLogin: {
//     type: Date,
//   },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     pincode: String,
//   },
//   emergencyContact: {
//     name: String,
//     phone: String,
//     relation: String,
//   },
// }, {
//   timestamps: true,
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     console.log('📝 Password not modified, skipping hash');
//     return next();
//   }
  
//   try {
//     console.log('🔐 Hashing password...');
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     console.log('✅ Password hashed successfully');
//     next();
//   } catch (error) {
//     console.error('❌ Password hashing error:', error);
//     next(error);
//   }
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   try {
//     console.log('🔐 Comparing password...');
//     console.log('   Has password stored:', !!this.password);
//     const isMatch = await bcrypt.compare(candidatePassword, this.password);
//     console.log(`   Password match result: ${isMatch}`);
//     return isMatch;
//   } catch (error) {
//     console.error('❌ Password comparison error:', error);
//     return false;
//   }
// };

// // Indexes
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });
// userSchema.index({ buildingId: 1 });
// userSchema.index({ isActive: 1 });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['super_admin', 'manager', 'supervisor', 'technician', 'customer'],
    required: true,
    default: 'customer',
  },
  technicianType: {
    type: String,
    // 🔥 CHANGE 1: Removed 'null' from enum (null is not a valid enum value)
    enum: ['electrician', 'cleaner', 'security', 'plumbing', 'waste_management', 'landscaping', 'catering', 'reception', 'ppm_staff'],
    // 🔥 CHANGE 2: Changed from default: null to default: undefined
    default: undefined,
    // 🔥 CHANGE 3: Added validate function to handle null values
    validate: {
      validator: function(value) {
        // Allow undefined (will be omitted from DB)
        if (value === undefined) return true;
        // Allow null (but convert to undefined in pre-save)
        if (value === null) return true;
        // Otherwise must be in enum
        return ['electrician', 'cleaner', 'security', 'plumbing', 'waste_management', 'landscaping', 'catering', 'reception', 'ppm_staff'].includes(value);
      },
      message: '{VALUE} is not a valid technician type'
    }
  },
  profileImage: {
    type: String,
    default: null,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null,
  },
  department: {
    type: String,
    trim: true,
  },
  shift: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  fcmTokens: [{
    type: String,
  }],
  lastLogin: {
    type: Date,
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
}, {
  timestamps: true,
});

// 🔥 CHANGE 4: ADDED NEW pre-validation middleware to clean up technicianType
userSchema.pre('validate', function(next) {
  // Convert empty string to undefined
  if (this.technicianType === '') {
    this.technicianType = undefined;
  }
  
  // Remove technicianType if role is not technician
  if (this.role !== 'technician') {
    this.technicianType = undefined;
  }
  
  // Convert null to undefined
  if (this.technicianType === null) {
    this.technicianType = undefined;
  }
  
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('📝 Password not modified, skipping hash');
    return next();
  }
  
  try {
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔐 Comparing password...');
    console.log('   Has password stored:', !!this.password);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`   Password match result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ buildingId: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);