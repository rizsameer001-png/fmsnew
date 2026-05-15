const Razorpay = require('razorpay');
const Payment = require('../models/Payment.model');
const Invoice = require('../models/Invoice.model');
const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const { sendEmail } = require('../services/email.service');
const { getRazorpayInstance } = require('../config/razorpay');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// Initialize Razorpay
const razorpay = getRazorpayInstance();

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private/Customer
const createOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice already paid' });
    }

    const options = {
      amount: Math.round(invoice.totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: invoice.invoiceNumber,
      payment_capture: 1,
      notes: {
        invoiceId: invoice._id.toString(),
        customerEmail: req.user.email
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      paymentId: order.id,
      invoiceId: invoice._id,
      customerId: req.user._id,
      amount: invoice.totalAmount,
      method: 'razorpay',
      status: 'pending',
      razorpayOrderId: order.id
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private/Customer
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, invoiceId } = req.body;
    const crypto = require('crypto');

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: 'success',
        paymentDate: new Date()
      },
      { new: true }
    );

    // Update invoice status
    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: 'razorpay',
        transactionId: paymentId
      },
      { new: true }
    );

    // Send confirmation email
    const customer = await User.findById(invoice.customerId);
    await sendEmail(customer.email, 'Payment Successful', 
      `Your payment of ${invoice.totalAmount} for invoice ${invoice.invoiceNumber} has been received.`);

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PAYMENT_SUCCESS',
      entityType: 'payment',
      entityId: payment._id,
      newData: { amount: payment.amount, invoiceId },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    logger.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private/Customer
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ customerId: req.user._id })
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .sort('-paymentDate');

    res.json({ success: true, payments });
  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('customerId', 'name email')
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .sort('-paymentDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
const refundPayment = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Cannot refund failed payment' });
    }

    // Call Razorpay refund API
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: amount ? amount * 100 : payment.amount * 100,
      notes: { reason }
    });

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = amount || payment.amount;
    await payment.save();

    // Update invoice status
    await Invoice.findByIdAndUpdate(payment.invoiceId, { status: 'cancelled' });

    res.json({ success: true, refund, payment });
  } catch (error) {
    logger.error('Refund payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPayments,
  refundPayment
};