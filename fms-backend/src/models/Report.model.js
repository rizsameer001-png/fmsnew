const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['attendance', 'complaint', 'financial', 'performance', 'sla', 'inventory', 'custom'],
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parameters: {
    startDate: Date,
    endDate: Date,
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    serviceType: String,
    status: String,
    customFilters: Map,
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  summary: {
    type: String,
  },
  statistics: {
    total: Number,
    average: Number,
    min: Number,
    max: Number,
    trend: String,
  },
  fileUrl: {
    type: String,
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf',
  },
  size: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating',
  },
  errorMessage: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Generate report number
reportSchema.pre('save', async function(next) {
  if (!this.reportNumber) {
    const count = await mongoose.model('Report').countDocuments();
    this.reportNumber = `RPT/${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Auto-expire reports after 30 days
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);