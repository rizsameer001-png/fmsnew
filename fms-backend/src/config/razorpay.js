const Razorpay = require('razorpay');

let razorpayInstance = null;

const initRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized');
  }
  return razorpayInstance;
};

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    return initRazorpay();
  }
  return razorpayInstance;
};

module.exports = { initRazorpay, getRazorpayInstance };