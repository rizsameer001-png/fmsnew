// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

// Phone number validation (Indian)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Password validation
export const isValidPassword = (password) => {
  if (!password) return false;
  if (password.length < 6) return false;
  if (password.length > 50) return false;
  if (!/\d/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  return true;
};

// Name validation
export const isValidName = (name) => {
  if (!name) return false;
  if (name.length < 2) return false;
  if (name.length > 100) return false;
  return true;
};

// Pincode validation
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

// GST validation
export const isValidGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

// PAN validation
export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

// URL validation
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Latitude validation
export const isValidLatitude = (lat) => {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
};

// Longitude validation
export const isValidLongitude = (lng) => {
  return typeof lng === 'number' && lng >= -180 && lng <= 180;
};

// Coordinates validation
export const isValidCoordinates = (lat, lng) => {
  return isValidLatitude(lat) && isValidLongitude(lng);
};

// Object ID validation (MongoDB)
export const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Date validation
export const isValidDate = (date) => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
};

// Date range validation
export const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isvalidDate(endDate)) return false;
  return new Date(startDate) <= new Date(endDate);
};

// Amount validation
export const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount >= 0 && isFinite(amount);
};

// Rating validation (1-5)
export const isValidRating = (rating) => {
  return typeof rating === 'number' && rating >= 1 && rating <= 5;
};

// Page number validation
export const isValidPage = (page) => {
  const num = parseInt(page);
  return !isNaN(num) && num >= 1;
};

// Limit validation
export const isValidLimit = (limit) => {
  const num = parseInt(limit);
  return !isNaN(num) && num >= 1 && num <= 100;
};

// Validate required fields
export const validateRequired = (data, requiredFields) => {
  const missing = [];
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    return { valid: false, message: `Missing required fields: ${missing.join(', ')}` };
  }
  return { valid: true };
};

// Validate login form
export const validateLogin = (email, password) => {
  const errors = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

// Validate registration form
export const validateRegistration = (data) => {
  const errors = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (!isValidName(data.name)) {
    errors.name = 'Name must be between 2 and 100 characters';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.phone) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters with one uppercase letter and one number';
  }
  
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

// Validate complaint form
export const validateComplaint = (data) => {
  const errors = {};
  
  if (!data.title) {
    errors.title = 'Title is required';
  } else if (data.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }
  
  if (!data.description) {
    errors.description = 'Description is required';
  } else if (data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  
  if (!data.serviceType) {
    errors.serviceType = 'Please select a service type';
  }
  
  if (!data.buildingId) {
    errors.buildingId = 'Please select a building';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

// Validate task form
export const validateTask = (data) => {
  const errors = {};
  
  if (!data.title) {
    errors.title = 'Title is required';
  }
  
  if (!data.assignedTo) {
    errors.assignedTo = 'Please select a technician';
  }
  
  if (!data.scheduledDate) {
    errors.scheduledDate = 'Please select a scheduled date';
  } else if (!isValidDate(data.scheduledDate)) {
    errors.scheduledDate = 'Invalid date';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

// Validate building form
export const validateBuilding = (data) => {
  const errors = {};
  
  if (!data.name) {
    errors.name = 'Building name is required';
  }
  
  if (!data.code) {
    errors.code = 'Building code is required';
  } else if (!/^[A-Z0-9]{3,10}$/.test(data.code)) {
    errors.code = 'Code must be 3-10 uppercase alphanumeric characters';
  }
  
  if (data.address?.pincode && !isValidPincode(data.address.pincode)) {
    errors.pincode = 'Invalid pincode (6 digits required)';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

// Validate invoice form
export const validateInvoice = (data) => {
  const errors = {};
  
  if (!data.customerId) {
    errors.customerId = 'Please select a customer';
  }
  
  if (!data.items || data.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    data.items.forEach((item, index) => {
      if (!item.description) {
        errors[`item_${index}_description`] = 'Description required';
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Valid quantity required';
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors[`item_${index}_price`] = 'Valid price required';
      }
    });
  }
  
  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  } else if (!isValidDate(data.dueDate)) {
    errors.dueDate = 'Invalid date';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

// Validate profile update
export const validateProfile = (data) => {
  const errors = {};
  
  if (data.name && !isValidName(data.name)) {
    errors.name = 'Name must be between 2 and 100 characters';
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

export default {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidName,
  isValidPincode,
  isValidGST,
  isValidPAN,
  isValidURL,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  isValidObjectId,
  isValidDate,
  isValidDateRange,
  isValidAmount,
  isValidRating,
  isValidPage,
  isValidLimit,
  validateRequired,
  validateLogin,
  validateRegistration,
  validateComplaint,
  validateTask,
  validateBuilding,
  validateInvoice,
  validateProfile,
};