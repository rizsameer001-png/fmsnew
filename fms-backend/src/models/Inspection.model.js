// const mongoose = require('mongoose');

// const inspectionSchema = new mongoose.Schema({
//   inspectionNumber: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   buildingId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Building',
//     required: true,
//   },
//   area: {
//     type: String,
//     required: true,
//   },
//   findings: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected', 'in_progress'],
//     default: 'pending',
//   },
//   photos: [{
//     type: String,
//   }],
//   recommendations: {
//     type: String,
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   },
// }, {
//   timestamps: true,
// });

// inspectionSchema.index({ inspectionNumber: 1 });
// inspectionSchema.index({ buildingId: 1 });
// inspectionSchema.index({ status: 1 });
// inspectionSchema.index({ createdBy: 1 });

// module.exports = mongoose.model('Inspection', inspectionSchema);


const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  inspectionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  findings: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_progress'],
    default: 'pending',
  },
  photos: [{
    type: String,
  }],
  recommendations: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

inspectionSchema.index({ inspectionNumber: 1 });
inspectionSchema.index({ buildingId: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);