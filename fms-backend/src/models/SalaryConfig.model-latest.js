const mongoose = require('mongoose');

const salaryConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  country: {
    type: String,
    enum: ['India', 'UAE', 'USA', 'Saudi Arabia', 'UK', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  currencySymbol: {
    type: String,
    default: '₹',
  },
  // Earnings Components
  earnings: [{
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, default: 0 },
    basedOn: { type: String, enum: ['basic', 'gross'], default: 'basic' },
    isTaxable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  // Deductions Components
  deductions: [{
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, default: 0 },
    basedOn: { type: String, enum: ['basic', 'gross', 'net'], default: 'basic' },
    isMandatory: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    maxAmount: { type: Number, default: null },
    minAmount: { type: Number, default: null }
  }],
  // Default Basic Salary Ranges by Role
  defaultBasicSalary: {
    super_admin: { type: Number, default: 80000 },
    manager: { type: Number, default: 50000 },
    supervisor: { type: Number, default: 35000 },
    technician: { type: Number, default: 25000 },
    customer: { type: Number, default: 0 }
  },
  // Tax Slabs
  taxSlabs: [{
    minAmount: Number,
    maxAmount: Number,
    percentage: Number,
    description: String
  }],
  // Additional Settings
  settings: {
    enableAttendanceDeduction: { type: Boolean, default: true },
    dailyRateCalculation: { type: String, enum: ['working_days', 'calendar_days'], default: 'working_days' },
    roundOff: { type: String, enum: ['none', 'nearest', 'up', 'down'], default: 'nearest' },
    includeOverTime: { type: Boolean, default: false },
    overTimeRate: { type: Number, default: 1.5 }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

salaryConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SalaryConfig', salaryConfigSchema);