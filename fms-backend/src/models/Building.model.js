const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Building name is required'],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  totalFloors: {
    type: Number,
    default: 0,
  },
  totalArea: {
    type: Number,
    default: 0,
  },
  constructionYear: {
    type: Number,
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
}, {
  timestamps: true,
});

buildingSchema.index({ name: 1 });
buildingSchema.index({ code: 1 });
buildingSchema.index({ managerId: 1 });

module.exports = mongoose.model('Building', buildingSchema);