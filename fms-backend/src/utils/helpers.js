const crypto = require('crypto');
const moment = require('moment');

// Generate random string
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

// Generate OTP
const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
};

// Generate unique ID
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Format currency
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date
const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

// Format datetime
const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm:ss') => {
  return moment(date).format(format);
};

// Calculate age from date of birth
const calculateAge = (dob) => {
  return moment().diff(moment(dob), 'years');
};

// Calculate days between two dates
const daysBetween = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

// Calculate hours between two times
const hoursBetween = (startTime, endTime) => {
  return moment(endTime).diff(moment(startTime), 'hours', true);
};

// Check if date is within range
const isDateInRange = (date, startDate, endDate) => {
  return moment(date).isBetween(moment(startDate), moment(endDate), undefined, '[]');
};

// Get start and end of day
const getDayRange = (date) => {
  const start = moment(date).startOf('day').toDate();
  const end = moment(date).endOf('day').toDate();
  return { start, end };
};

// Get start and end of week
const getWeekRange = (date) => {
  const start = moment(date).startOf('week').toDate();
  const end = moment(date).endOf('week').toDate();
  return { start, end };
};

// Get start and end of month
const getMonthRange = (date) => {
  const start = moment(date).startOf('month').toDate();
  const end = moment(date).endOf('month').toDate();
  return { start, end };
};

// Get start and end of year
const getYearRange = (date) => {
  const start = moment(date).startOf('year').toDate();
  const end = moment(date).endOf('year').toDate();
  return { start, end };
};

// Sleep/delay function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function with exponential backoff
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Pick specific fields from object
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj && obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

// Omit specific fields from object
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// Convert string to slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// Mask email (e.g., u***r@example.com)
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  const maskedLocal = local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
};

// Mask phone (e.g., +91*****1234)
const maskPhone = (phone) => {
  const phoneStr = phone.toString();
  const start = phoneStr.slice(0, 3);
  const end = phoneStr.slice(-4);
  return `${start}****${end}`;
};

// Validate Indian mobile number
const isValidIndianMobile = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

// Validate PAN card
const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

// Validate GST number
const isValidGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

// Convert number to words (Indian system)
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertToWords = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertToWords(n % 100) : '');
  };
  
  if (num === 0) return 'Zero';
  
  let result = '';
  if (num >= 10000000) {
    result += convertToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    result += convertToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num > 0) {
    result += convertToWords(num);
  }
  
  return result.trim();
};

module.exports = {
  generateRandomString,
  generateOTP,
  generateUniqueId,
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateAge,
  daysBetween,
  hoursBetween,
  isDateInRange,
  getDayRange,
  getWeekRange,
  getMonthRange,
  getYearRange,
  sleep,
  retry,
  deepClone,
  isEmpty,
  pick,
  omit,
  slugify,
  maskEmail,
  maskPhone,
  isValidIndianMobile,
  isValidEmail,
  isValidPAN,
  isValidGST,
  numberToWords
};