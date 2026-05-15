const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  floorNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  totalRooms: {
    type: Number,
    default: 0,
  },
  totalArea: {
    type: Number,
    default: 0,
  },
  facilities: [{
    type: String,
    enum: ['washroom', 'cafeteria', 'parking', 'garden', 'gym', 'conference_room'],
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

// Compound index to ensure unique floor per building
floorSchema.index({ buildingId: 1, floorNumber: 1 }, { unique: true });

module.exports = mongoose.model('Floor', floorSchema);