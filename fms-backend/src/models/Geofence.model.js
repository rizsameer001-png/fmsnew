const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  coordinates: {
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    radius: {
      type: Number, // in meters
      required: true,
    },
    polygon: [{
      latitude: Number,
      longitude: Number,
    }],
  },
  shape: {
    type: String,
    enum: ['circle', 'polygon'],
    default: 'circle',
  },
  allowedRoles: [{
    type: String,
    enum: ['supervisor', 'technician', 'security', 'cleaning', 'all'],
  }],
  checkInRequired: {
    type: Boolean,
    default: true,
  },
  checkOutRequired: {
    type: Boolean,
    default: true,
  },
  allowedCheckInTime: {
    start: String,
    end: String,
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
}, {
  timestamps: true,
});

geofenceSchema.index({ buildingId: 1 });
geofenceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Geofence', geofenceSchema);