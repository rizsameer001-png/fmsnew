const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  leaveNumber: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'earned', 'unpaid', 'emergency', 'maternity', 'paternity', 'bereavement', 'annual'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedByName: String,
  approvedAt: Date,
  rejectionReason: String,
  attachments: [{
    name: String,
    url: String,
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

leaveSchema.pre('save', async function(next) {
  if (!this.leaveNumber) {
    const count = await mongoose.model('Leave').countDocuments();
    const year = new Date().getFullYear();
    this.leaveNumber = `LV/${year}/${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

leaveSchema.index({ userId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: -1 });
leaveSchema.index({ leaveType: 1 });

module.exports = mongoose.model('Leave', leaveSchema);