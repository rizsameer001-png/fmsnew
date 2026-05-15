const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskNumber: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'verified', 'cancelled'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledStartTime: {
    type: String,
  },
  scheduledEndTime: {
    type: String,
  },
  actualStartTime: {
    type: Date,
  },
  actualEndTime: {
    type: Date,
  },
  duration: {
    type: Number, // in minutes
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date,
  }],
  completionProof: [{
    type: String, // URLs of photos/videos
  }],
  verificationNotes: {
    type: String,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: {
    type: Date,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
  },
  ppmTask: {
    isPPM: { type: Boolean, default: false },
    ppmScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'PPM_Schedule' },
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

// Generate task number before saving
taskSchema.pre('save', async function(next) {
  if (!this.taskNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Task').countDocuments();
    this.taskNumber = `TSK/${year}${month}/${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate duration when task is completed
taskSchema.pre('save', function(next) {
  if (this.actualStartTime && this.actualEndTime && this.isModified('actualEndTime')) {
    this.duration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  next();
});

// Indexes
taskSchema.index({ taskNumber: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ scheduledDate: 1 });
taskSchema.index({ buildingId: 1 });

module.exports = mongoose.model('Task', taskSchema);