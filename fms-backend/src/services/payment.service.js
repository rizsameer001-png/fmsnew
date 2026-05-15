const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
//const logger = require('../utils/logger');
const { logger } = require('../utils/logger');  // Fixed: use destructuring

let razorpay = null;

const getRazorpay = () => {
  if (!razorpay) {
    razorpay = getRazorpayInstance();
  }
  return razorpay;
};

// Create order
const createOrder = async (amount, currency, receipt, notes = {}) => {
  try {
    const razorpayInstance = getRazorpay();
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency || 'INR',
      receipt,
      payment_capture: 1,
      notes,
    };
    
    const order = await razorpayInstance.orders.create(options);
    logger.info(`Order created: ${order.id} for amount ${amount}`);
    return { success: true, order };
  } catch (error) {
    logger.error('Create order error:', error);
    return { success: false, error: error.message };
  }
};

// Verify payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    
    const isValid = expectedSignature === signature;
    if (isValid) {
      logger.info(`Payment signature verified for order: ${orderId}`);
    } else {
      logger.warn(`Invalid payment signature for order: ${orderId}`);
    }
    return isValid;
  } catch (error) {
    logger.error('Verify signature error:', error);
    return false;
  }
};

// Fetch payment details
const fetchPayment = async (paymentId) => {
  try {
    const razorpayInstance = getRazorpay();
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return { success: true, payment };
  } catch (error) {
    logger.error('Fetch payment error:', error);
    return { success: false, error: error.message };
  }
};

// Refund payment
const refundPayment = async (paymentId, amount, notes = {}) => {
  try {
    const razorpayInstance = getRazorpay();
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
      notes,
    });
    logger.info(`Refund processed for payment: ${paymentId}, refund ID: ${refund.id}`);
    return { success: true, refund };
  } catch (error) {
    logger.error('Refund payment error:', error);
    return { success: false, error: error.message };
  }
};

// Capture payment
const capturePayment = async (paymentId, amount) => {
  try {
    const razorpayInstance = getRazorpay();
    const capture = await razorpayInstance.payments.capture(paymentId, Math.round(amount * 100));
    logger.info(`Payment captured: ${paymentId}`);
    return { success: true, capture };
  } catch (error) {
    logger.error('Capture payment error:', error);
    return { success: false, error: error.message };
  }
};

// Create refund link
const createRefundLink = async (paymentId, amount, description) => {
  try {
    const razorpayInstance = getRazorpay();
    const refundLink = await razorpayInstance.refunds.create({
      payment_id: paymentId,
      amount: Math.round(amount * 100),
      notes: { description },
    });
    return { success: true, refundLink };
  } catch (error) {
    logger.error('Create refund link error:', error);
    return { success: false, error: error.message };
  }
};

// Get bank list for UPI
const getBankList = () => {
  return [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Yes Bank',
    'Bank of Baroda',
    'Punjab National Bank',
    'Canara Bank',
    'Union Bank of India',
  ];
};

// Validate UPI ID
const validateUPIId = (upiId) => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
};

// Validate card number (basic Luhn check)
const validateCardNumber = (cardNumber) => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

// Validate CVV
const validateCVV = (cvv) => {
  const cvvStr = cvv.toString();
  return cvvStr.length >= 3 && cvvStr.length <= 4 && /^\d+$/.test(cvvStr);
};

// Get payment method icons
const getPaymentMethodIcon = (method) => {
  const icons = {
    razorpay: 'https://razorpay.com/favicon.png',
    upi: 'https://www.npci.org.in/images/logo-upi.png',
    netbanking: 'https://example.com/netbanking-icon.png',
    card: 'https://example.com/card-icon.png',
  };
  return icons[method] || null;
};

// Calculate EMI options
const calculateEMIOptions = (amount, tenureMonths) => {
  const interestRate = 12; // 12% per annum
  const monthlyRate = interestRate / 12 / 100;
  
  const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - amount;
  
  return {
    amount,
    tenureMonths,
    interestRate,
    emi: Math.round(emi),
    totalPayable: Math.round(totalPayable),
    totalInterest: Math.round(totalInterest),
  };
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  refundPayment,
  capturePayment,
  createRefundLink,
  getBankList,
  validateUPIId,
  validateCardNumber,
  validateCVV,
  getPaymentMethodIcon,
  calculateEMIOptions,
};