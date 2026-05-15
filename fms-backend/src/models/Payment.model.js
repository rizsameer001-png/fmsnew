const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  method: {
    type: String,
    enum: ['razorpay', 'upi', 'netbanking', 'card', 'cash', 'cheque'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  upiId: {
    type: String,
  },
  cardLast4: {
    type: String,
  },
  bankName: {
    type: String,
  },
  chequeNumber: {
    type: String,
  },
  receiptUrl: {
    type: String,
  },
  failureReason: {
    type: String,
  },
  refundId: {
    type: String,
  },
  refundAmount: {
    type: Number,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: String,
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

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);