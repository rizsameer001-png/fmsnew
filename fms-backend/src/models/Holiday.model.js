const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['public', 'company', 'restricted', 'festival'],
    required: true,
  },
  applicableTo: [{
    type: String,
    enum: ['all', 'technician', 'supervisor', 'manager', 'office'],
    default: ['all'],
  }],
  buildings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
  }],
  isPaid: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
  year: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure no duplicate holidays on same date for same building
holidaySchema.index({ date: 1, buildings: 1 });
holidaySchema.index({ year: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);