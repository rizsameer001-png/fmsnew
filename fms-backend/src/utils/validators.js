const validator = {};

// Validate required fields
validator.validateRequired = (data, requiredFields) => {
  const missing = [];
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    return { valid: false, message: `Missing required fields: ${missing.join(', ')}` };
  }
  return { valid: true };
};

// Validate email
validator.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!email) return { valid: false, message: 'Email is required' };
  if (!emailRegex.test(email)) return { valid: false, message: 'Invalid email format' };
  return { valid: true };
};

// Validate phone (Indian)
validator.validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone) return { valid: false, message: 'Phone number is required' };
  if (!phoneRegex.test(phone)) return { valid: false, message: 'Invalid Indian mobile number' };
  return { valid: true };
};

// Validate password strength
validator.validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  if (password.length > 50) return { valid: false, message: 'Password must be less than 50 characters' };
  
  // Check for at least one number
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  
  return { valid: true };
};

// Validate name
validator.validateName = (name) => {
  if (!name) return { valid: false, message: 'Name is required' };
  if (name.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
  if (name.length > 100) return { valid: false, message: 'Name must be less than 100 characters' };
  return { valid: true };
};

// Validate role
validator.validateRole = (role) => {
  const validRoles = ['super_admin', 'manager', 'supervisor', 'technician', 'customer'];
  if (!role) return { valid: false, message: 'Role is required' };
  if (!validRoles.includes(role)) return { valid: false, message: 'Invalid role' };
  return { valid: true };
};

// Validate technician type
validator.validateTechnicianType = (type) => {
  const validTypes = ['electrician', 'cleaner', 'security', 'plumbing', 'waste_management', 'landscaping', 'catering', 'reception', 'ppm_staff'];
  if (type && !validTypes.includes(type)) return { valid: false, message: 'Invalid technician type' };
  return { valid: true };
};

// Validate complaint priority
validator.validatePriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!priority) return { valid: false, message: 'Priority is required' };
  if (!validPriorities.includes(priority)) return { valid: false, message: 'Invalid priority' };
  return { valid: true };
};

// Validate complaint status
validator.validateComplaintStatus = (status) => {
  const validStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected', 'escalated'];
  if (!status) return { valid: false, message: 'Status is required' };
  if (!validStatuses.includes(status)) return { valid: false, message: 'Invalid status' };
  return { valid: true };
};

// Validate task status
validator.validateTaskStatus = (status) => {
  const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'verified', 'cancelled'];
  if (!status) return { valid: false, message: 'Status is required' };
  if (!validStatuses.includes(status)) return { valid: false, message: 'Invalid status' };
  return { valid: true };
};

// Validate date
validator.validateDate = (date, fieldName = 'Date') => {
  if (!date) return { valid: false, message: `${fieldName} is required` };
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return { valid: false, message: `Invalid ${fieldName} format` };
  return { valid: true, date: parsedDate };
};

// Validate date range
validator.validateDateRange = (startDate, endDate) => {
  const startValid = validator.validateDate(startDate, 'Start date');
  if (!startValid.valid) return startValid;
  
  const endValid = validator.validateDate(endDate, 'End date');
  if (!endValid.valid) return endValid;
  
  if (endValid.date < startValid.date) {
    return { valid: false, message: 'End date must be after start date' };
  }
  
  return { valid: true };
};

// Validate number
validator.validateNumber = (num, fieldName = 'Number', min = null, max = null) => {
  if (num === undefined || num === null) return { valid: false, message: `${fieldName} is required` };
  if (typeof num !== 'number' || isNaN(num)) return { valid: false, message: `${fieldName} must be a number` };
  if (min !== null && num < min) return { valid: false, message: `${fieldName} must be at least ${min}` };
  if (max !== null && num > max) return { valid: false, message: `${fieldName} must be at most ${max}` };
  return { valid: true };
};

// Validate amount
validator.validateAmount = (amount) => {
  return validator.validateNumber(amount, 'Amount', 0);
};

// Validate rating (1-5)
validator.validateRating = (rating) => {
  return validator.validateNumber(rating, 'Rating', 1, 5);
};

// Validate building code
validator.validateBuildingCode = (code) => {
  if (!code) return { valid: false, message: 'Building code is required' };
  if (!/^[A-Z0-9]{3,10}$/.test(code)) return { valid: false, message: 'Building code must be 3-10 uppercase alphanumeric characters' };
  return { valid: true };
};

// Validate pincode
validator.validatePincode = (pincode) => {
  if (!pincode) return { valid: false, message: 'Pincode is required' };
  if (!/^\d{6}$/.test(pincode)) return { valid: false, message: 'Invalid pincode (must be 6 digits)' };
  return { valid: true };
};

// Validate GST number
validator.validateGST = (gst) => {
  if (!gst) return { valid: true }; // GST is optional
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gst)) return { valid: false, message: 'Invalid GST number format' };
  return { valid: true };
};

// Validate PAN number
validator.validatePAN = (pan) => {
  if (!pan) return { valid: true }; // PAN is optional
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) return { valid: false, message: 'Invalid PAN number format' };
  return { valid: true };
};

// Validate URL
validator.validateURL = (url) => {
  if (!url) return { valid: true };
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }
};

// Validate latitude
validator.validateLatitude = (lat) => {
  if (lat === undefined || lat === null) return { valid: true };
  if (typeof lat !== 'number' || lat < -90 || lat > 90) return { valid: false, message: 'Invalid latitude (must be between -90 and 90)' };
  return { valid: true };
};

// Validate longitude
validator.validateLongitude = (lng) => {
  if (lng === undefined || lng === null) return { valid: true };
  if (typeof lng !== 'number' || lng < -180 || lng > 180) return { valid: false, message: 'Invalid longitude (must be between -180 and 180)' };
  return { valid: true };
};

// Validate coordinates
validator.validateCoordinates = (latitude, longitude) => {
  const latValid = validator.validateLatitude(latitude);
  if (!latValid.valid) return latValid;
  const lngValid = validator.validateLongitude(longitude);
  if (!lngValid.valid) return lngValid;
  return { valid: true };
};

// Validate object ID (MongoDB)
validator.validateObjectId = (id, fieldName = 'ID') => {
  if (!id) return { valid: false, message: `${fieldName} is required` };
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return { valid: false, message: `Invalid ${fieldName} format` };
  return { valid: true };
};

// Validate array of object IDs
validator.validateObjectIds = (ids, fieldName = 'IDs') => {
  if (!ids || !Array.isArray(ids)) return { valid: false, message: `${fieldName} must be an array` };
  for (const id of ids) {
    const valid = validator.validateObjectId(id, fieldName);
    if (!valid.valid) return valid;
  }
  return { valid: true };
};

// Validate pagination params
validator.validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  if (pageNum < 1) return { valid: false, message: 'Page must be at least 1' };
  if (limitNum < 1) return { valid: false, message: 'Limit must be at least 1' };
  if (limitNum > 100) return { valid: false, message: 'Limit cannot exceed 100' };
  return { valid: true, page: pageNum, limit: limitNum };
};

module.exports = validator;