const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear(),
  },
  balances: {
    sick: { type: Number, default: 12 },
    casual: { type: Number, default: 12 },
    earned: { type: Number, default: 15 },
    annual: { type: Number, default: 20 },
    emergency: { type: Number, default: 3 },
    maternity: { type: Number, default: 180 },
    paternity: { type: Number, default: 15 },
    bereavement: { type: Number, default: 5 },
  },
  used: {
    sick: { type: Number, default: 0 },
    casual: { type: Number, default: 0 },
    earned: { type: Number, default: 0 },
    annual: { type: Number, default: 0 },
    emergency: { type: Number, default: 0 },
    maternity: { type: Number, default: 0 },
    paternity: { type: Number, default: 0 },
    bereavement: { type: Number, default: 0 },
  },
  pending: {
    sick: { type: Number, default: 0 },
    casual: { type: Number, default: 0 },
    earned: { type: Number, default: 0 },
    annual: { type: Number, default: 0 },
    emergency: { type: Number, default: 0 },
    maternity: { type: Number, default: 0 },
    paternity: { type: Number, default: 0 },
    bereavement: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

leaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);