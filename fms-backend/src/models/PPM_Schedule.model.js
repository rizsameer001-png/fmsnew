const mongoose = require('mongoose');

const ppmScheduleSchema = new mongoose.Schema({
  scheduleNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
  },
  equipmentId: {
    type: String,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'yearly', 'custom'],
    required: true,
  },
  customDays: {
    type: Number,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  lastRunDate: {
    type: Date,
  },
  nextRunDate: {
    type: Date,
    required: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  checklist: [{
    taskName: String,
    isRequired: Boolean,
    estimatedTime: Number, // in minutes
  }],
  documents: [{
    name: String,
    url: String,
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'paused'],
    default: 'active',
  },
  isRecurring: {
    type: Boolean,
    default: true,
  },
  reminderDays: [{
    type: Number, // days before to send reminder
  }],
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

// Generate schedule number
ppmScheduleSchema.pre('save', async function(next) {
  if (!this.scheduleNumber) {
    const count = await mongoose.model('PPM_Schedule').countDocuments();
    this.scheduleNumber = `PPM/${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate next run date based on frequency
ppmScheduleSchema.methods.calculateNextRunDate = function() {
  const lastRun = this.lastRunDate || this.startDate;
  const nextRun = new Date(lastRun);
  
  switch(this.frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
    case 'quarterly':
      nextRun.setMonth(nextRun.getMonth() + 3);
      break;
    case 'half_yearly':
      nextRun.setMonth(nextRun.getMonth() + 6);
      break;
    case 'yearly':
      nextRun.setFullYear(nextRun.getFullYear() + 1);
      break;
    case 'custom':
      if (this.customDays) {
        nextRun.setDate(nextRun.getDate() + this.customDays);
      }
      break;
  }
  
  return nextRun;
};

// Indexes
ppmScheduleSchema.index({ scheduleNumber: 1 });
ppmScheduleSchema.index({ buildingId: 1 });
ppmScheduleSchema.index({ nextRunDate: 1 });
ppmScheduleSchema.index({ status: 1 });
ppmScheduleSchema.index({ frequency: 1 });

module.exports = mongoose.model('PPM_Schedule', ppmScheduleSchema);