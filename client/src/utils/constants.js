// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
};

// Technician Types
export const TECHNICIAN_TYPES = {
  ELECTRICIAN: 'electrician',
  CLEANER: 'cleaner',
  SECURITY: 'security',
  PLUMBING: 'plumbing',
  WASTE_MANAGEMENT: 'waste_management',
  LANDSCAPING: 'landscaping',
  CATERING: 'catering',
  RECEPTION: 'reception',
  PPM_STAFF: 'ppm_staff',
};

// Complaint Status
export const COMPLAINT_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  ESCALATED: 'escalated',
};

// Complaint Priority
export const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VERIFIED: 'verified',
  CANCELLED: 'cancelled',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  HOLIDAY: 'holiday',
  LEAVE: 'leave',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Invoice Status
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  COMPLAINT: 'complaint',
  TASK: 'task',
  ATTENDANCE: 'attendance',
  BILLING: 'billing',
  EMERGENCY: 'emergency',
  APPROVAL: 'approval',
  CHAT: 'chat',
  SYSTEM: 'system',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    GET_ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    BASE: '/users',
    TECHNICIANS: '/users/technicians',
    STATS: '/users/stats',
    TEAM: '/users/team',
  },
  BUILDINGS: {
    BASE: '/buildings',
    FLOORS: '/buildings/:id/floors',
    ZONES: '/buildings/:id/zones',
  },
  COMPLAINTS: {
    BASE: '/complaints',
    STATS: '/complaints/stats',
    ASSIGN: '/complaints/:id/assign',
    STATUS: '/complaints/:id/status',
    RATE: '/complaints/:id/rate',
    ESCALATE: '/complaints/:id/escalate',
  },
  TASKS: {
    BASE: '/tasks',
    MY_TASKS: '/tasks/my',
    ASSIGN: '/tasks/:id/assign',
    STATUS: '/tasks/:id/status',
    VERIFY: '/tasks/:id/verify',
    UPLOAD_PROOF: '/tasks/:id/upload-proof',
  },
  ATTENDANCE: {
    CHECKIN: '/attendance/checkin',
    CHECKOUT: '/attendance/checkout',
    MY_ATTENDANCE: '/attendance/my',
    TEAM_ATTENDANCE: '/attendance/team',
    REPORT: '/attendance/report',
    APPROVE: '/attendance/:id/approve',
  },
  INVOICES: {
    BASE: '/invoices',
    MY_INVOICES: '/invoices/my',
    PDF: '/invoices/:id/pdf',
  },
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify',
    HISTORY: '/payments/history',
    REFUND: '/payments/:id/refund',
  },
  CHAT: {
    BASE: '/chats',
    MESSAGES: '/chats/:chatId/messages',
    SEND: '/chats/send',
    GROUP: '/chats/group',
    SUPPORT: '/chats/support',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: '/notifications/:id/read',
    READ_ALL: '/notifications/read-all',
    UNREAD_COUNT: '/notifications/unread/count',
    PUSH_TOKEN: '/notifications/push-token',
  },
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    MANAGER: '/dashboard/manager',
    SUPERVISOR: '/dashboard/supervisor',
    TECHNICIAN: '/dashboard/technician',
    CUSTOMER: '/dashboard/customer',
  },
  REPORTS: {
    ANALYTICS: '/reports/analytics',
    EXPORT: '/reports/export',
    ATTENDANCE: '/reports/attendance',
    COMPLAINT: '/reports/complaint',
    FINANCIAL: '/reports/financial',
    PERFORMANCE: '/reports/performance',
    ACTIVITY_LOGS: '/reports/activity-logs',
  },
  GPS: {
    LOCATION: '/gps/location',
    LIVE: '/gps/live',
    TECHNICIAN: '/gps/technician/:userId',
    HISTORY: '/gps/history/:userId',
    EMERGENCY: '/gps/emergency',
    VALIDATE_GEOFENCE: '/gps/validate-geofence',
  },
  PPM: {
    BASE: '/ppm',
    GENERATE_TASKS: '/ppm/generate-tasks',
    UPCOMING: '/ppm/upcoming/tasks',
    BUILDING: '/ppm/building/:buildingId',
    HISTORY: '/ppm/:id/history',
  },
  APPROVALS: {
    BASE: '/approvals',
    PENDING_COUNT: '/approvals/pending/count',
    TYPE: '/approvals/type/:type',
    CANCEL: '/approvals/:id/cancel',
  },
  SERVICES: {
    BASE: '/services',
    CATEGORIES: '/services/categories',
    SLA_POLICIES: '/services/sla-policies',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  NOTIFICATIONS: 'notifications',
};

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  TYPING: 'typing',
  MARK_READ: 'mark_read',
  UPDATE_LOCATION: 'update_location',
  TECHNICIAN_LOCATION: 'technician_location',
  EMERGENCY_ALERT: 'emergency_alert',
  NEW_NOTIFICATION: 'new_notification',
  COMPLAINT_UPDATED: 'complaint_updated',
  TASK_UPDATED: 'task_updated',
  ATTENDANCE_UPDATE: 'attendance_update',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME: 'HH:mm',
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  MAX_FILES: 5,
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#4F46E5',
  SECONDARY: '#10B981',
  DANGER: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  PURPLE: '#8B5CF6',
  PINK: '#EC4899',
  GRAY: '#6B7280',
};

// Status Colors Mapping
export const STATUS_COLORS = {
  // Complaint statuses
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-orange-100 text-orange-800',
  
  // Priority colors
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
  
  // Attendance statuses
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  half_day: 'bg-orange-100 text-orange-800',
  holiday: 'bg-purple-100 text-purple-800',
  leave: 'bg-blue-100 text-blue-800',
  
  // Invoice statuses
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  sent: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-800',
  
  // Payment statuses
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  refunded: 'bg-purple-100 text-purple-800',
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/,
  PINCODE: /^\d{6}$/,
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
};

// Route Paths
export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_OTP: '/verify-otp',
    SERVICES: '/services',
    ABOUT: '/about',
    CONTACT: '/contact',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BUILDINGS: '/admin/buildings',
    ROLES: '/admin/roles',
    COMPLAINTS: '/admin/complaints',
    ATTENDANCE: '/admin/attendance',
    GPS_TRACKING: '/admin/gps-tracking',
    BILLING: '/admin/billing',
    REPORTS: '/admin/reports',
    APPROVALS: '/admin/approvals',
    CHAT_CONTROL: '/admin/chat-control',
    NOTIFICATIONS: '/admin/notifications',
    SERVICE_CONFIG: '/admin/service-config',
    SETTINGS: '/admin/settings',
    ACTIVITY_LOGS: '/admin/activity-logs',
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    SUPERVISORS: '/manager/supervisors',
    TECHNICIANS: '/manager/technicians',
    COMPLAINTS: '/manager/complaints',
    SLA: '/manager/sla',
    ATTENDANCE: '/manager/attendance',
    SCHEDULING: '/manager/scheduling',
    APPROVALS: '/manager/approvals',
    REPORTS: '/manager/reports',
  },
  SUPERVISOR: {
    DASHBOARD: '/supervisor/dashboard',
    TECHNICIANS: '/supervisor/technicians',
    FIELD_STAFF: '/supervisor/field-staff',
    VERIFICATION: '/supervisor/verification',
    COMPLAINTS: '/supervisor/complaints',
    INSPECTION: '/supervisor/inspection',
    ESCALATE: '/supervisor/escalate',
  },
  TECHNICIAN: {
    DASHBOARD: '/technician/dashboard',
    TASKS: '/technician/tasks',
    ATTENDANCE: '/technician/attendance',
    GPS: '/technician/gps',
    NOTIFICATIONS: '/technician/notifications',
    EMERGENCY: '/technician/emergency',
    PROFILE: '/technician/profile',
  },
  CUSTOMER: {
    DASHBOARD: '/customer/dashboard',
    RAISE_COMPLAINT: '/customer/raise-complaint',
    REQUEST_SERVICE: '/customer/request-service',
    COMPLAINTS: '/customer/complaints',
    INVOICES: '/customer/invoices',
    PAYMENTS: '/customer/payments',
    CHAT: '/customer/chat',
    HISTORY: '/customer/history',
    PROFILE: '/customer/profile',
  },
};