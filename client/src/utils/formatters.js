import { format, formatDistance, formatDistanceToNow, isValid } from 'date-fns';

// Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Date formatting
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return 'N/A';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(parsedDate)) return 'Invalid Date';
  return format(parsedDate, formatStr);
};

// DateTime formatting
export const formatDateTime = (date, formatStr = 'dd/MM/yyyy HH:mm') => {
  if (!date) return 'N/A';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(parsedDate)) return 'Invalid Date';
  return format(parsedDate, formatStr);
};

// Time formatting
export const formatTime = (date, formatStr = 'HH:mm') => {
  if (!date) return 'N/A';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(parsedDate)) return 'Invalid Time';
  return format(parsedDate, formatStr);
};

// Relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(parsedDate)) return 'Invalid Date';
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

// Format duration in minutes to readable string
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Convert snake_case to Title Case
export const snakeToTitle = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-IN');
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    // Complaint statuses
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    escalated: 'bg-orange-100 text-orange-800',
    
    // Priority
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
    
    // Attendance
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    half_day: 'bg-orange-100 text-orange-800',
    
    // Invoice
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    sent: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
    
    // User status
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    
    // Task status
    completed: 'bg-green-100 text-green-800',
    verified: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  
  return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Get priority badge class
export const getPriorityBadgeClass = (priority) => {
  const priorityMap = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return priorityMap[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Format address
export const formatAddress = (address) => {
  if (!address) return 'N/A';
  const parts = [address.street, address.city, address.state, address.pincode].filter(Boolean);
  return parts.join(', ');
};

// Format coordinates
export const formatCoordinates = (lat, lng) => {
  if (!lat || !lng) return 'N/A';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// Get rating stars
export const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return {
    full: fullStars,
    half: hasHalfStar,
    empty: emptyStars,
  };
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatDuration,
  formatPhoneNumber,
  truncateText,
  getInitials,
  capitalizeWords,
  snakeToTitle,
  formatNumber,
  formatPercentage,
  formatFileSize,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  formatAddress,
  formatCoordinates,
  getRatingStars,
};