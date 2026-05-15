const mongoose = require('mongoose');

const zoneRoomSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['zone', 'room', 'office', 'conference', 'restroom', 'cafeteria', 'parking', 'garden', 'storage', 'other'],
    required: true,
  },
  area: {
    type: Number,
    default: 0,
  },
  capacity: {
    type: Number,
  },
  facilities: [{
    type: String,
  }],
  assets: [{
    assetId: String,
    name: String,
    type: String,
    purchaseDate: Date,
    warrantyExpiry: Date,
  }],
  qrCode: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
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

// Ensure unique room code per building
zoneRoomSchema.index({ buildingId: 1, code: 1 }, { unique: true });
zoneRoomSchema.index({ floorId: 1 });
zoneRoomSchema.index({ type: 1 });

module.exports = mongoose.model('ZoneRoom', zoneRoomSchema);