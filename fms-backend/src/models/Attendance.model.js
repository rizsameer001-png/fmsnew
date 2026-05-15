const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    time: { type: Date },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    photo: { type: String },
    deviceInfo: {
      deviceId: String,
      platform: String,
      ip: String,
    },
  },
  checkOut: {
    time: { type: Date },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    photo: { type: String },
    deviceInfo: {
      deviceId: String,
      platform: String,
      ip: String,
    },
  },
  totalHours: {
    type: Number,
    default: 0,
  },
  overtime: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'holiday', 'leave'],
    default: 'absent',
  },
  lateMinutes: {
    type: Number,
    default: 0,
  },
  earlyExitMinutes: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
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

// Calculate total hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn.time && this.checkOut.time) {
    const hours = (this.checkOut.time - this.checkIn.time) / (1000 * 60 * 60);
    this.totalHours = Math.round(hours * 100) / 100;
    
    // Calculate late minutes
    const shiftStart = new Date(this.checkIn.time);
    shiftStart.setHours(9, 0, 0); // Default shift start 9 AM
    if (this.checkIn.time > shiftStart) {
      this.lateMinutes = Math.round((this.checkIn.time - shiftStart) / (1000 * 60));
      this.status = this.lateMinutes > 30 ? 'late' : 'present';
    } else {
      this.status = 'present';
    }
  }
  next();
});

// Indexes
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);