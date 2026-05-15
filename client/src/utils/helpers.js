// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Pick specific fields from object
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj && obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

// Omit specific fields from object
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// Generate random string
export const generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// Generate random number between min and max
export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Sleep/delay function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function with exponential backoff
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

// Download file from blob
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error('Failed to copy:', error);
    return { success: false, error };
  }
};

// Get query params from URL
export const getQueryParams = (search) => {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Build query string from object
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Merge class names
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Get color based on value (for charts, etc.)
export const getColorByIndex = (index) => {
  const colors = [
    '#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
  ];
  return colors[index % colors.length];
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Sort array by key
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, keys) => {
  if (!searchTerm) return array;
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format distance
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

// Detect device type
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Local storage wrapper
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

// Session storage wrapper
export const sessionStorage = {
  get: (key) => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    window.sessionStorage.removeItem(key);
  },
  clear: () => {
    window.sessionStorage.clear();
  },
};

export default {
  debounce,
  throttle,
  deepClone,
  isEmpty,
  pick,
  omit,
  generateRandomString,
  randomBetween,
  sleep,
  retry,
  downloadFile,
  copyToClipboard,
  getQueryParams,
  buildQueryString,
  cn,
  getColorByIndex,
  calculatePercentage,
  groupBy,
  sortBy,
  filterBySearch,
  calculateDistance,
  formatDistance,
  getDeviceType,
  isOnline,
  storage,
  sessionStorage,
};