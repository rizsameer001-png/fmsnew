// User Roles
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer'
};

// Technician Types
const TECHNICIAN_TYPES = {
  ELECTRICIAN: 'electrician',
  CLEANER: 'cleaner',
  SECURITY: 'security',
  PLUMBING: 'plumbing',
  WASTE_MANAGEMENT: 'waste_management',
  LANDSCAPING: 'landscaping',
  CATERING: 'catering',
  RECEPTION: 'reception',
  PPM_STAFF: 'ppm_staff'
};

// Complaint Status
const COMPLAINT_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  ESCALATED: 'escalated'
};

// Complaint Priority
const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Task Status
const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VERIFIED: 'verified',
  CANCELLED: 'cancelled'
};

// Attendance Status
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  HOLIDAY: 'holiday',
  LEAVE: 'leave'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Invoice Status
const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Approval Types
const APPROVAL_TYPES = {
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  COMPLAINT_CLOSURE: 'complaint_closure',
  EXPENSE: 'expense',
  PURCHASE: 'purchase'
};

// Notification Types
const NOTIFICATION_TYPES = {
  COMPLAINT: 'complaint',
  TASK: 'task',
  ATTENDANCE: 'attendance',
  BILLING: 'billing',
  EMERGENCY: 'emergency',
  APPROVAL: 'approval',
  CHAT: 'chat',
  SYSTEM: 'system',
  REMINDER: 'reminder'
};

// Notification Channels
const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
  INAPP: 'inapp'
};

// Service Categories
const SERVICE_CATEGORIES = {
  CLEANING: 'cleaning',
  SECURITY: 'security',
  WASTE_MANAGEMENT: 'waste_management',
  PLUMBING: 'plumbing',
  ELECTRICAL: 'electrical',
  LANDSCAPING: 'landscaping',
  CATERING: 'catering',
  HOSPITALITY: 'hospitality',
  RECEPTION: 'reception',
  HVAC: 'hvac'
};

// SLA Priorities (in hours)
const SLA_PRIORITIES = {
  low: { response: 24, resolution: 72 },
  medium: { response: 12, resolution: 48 },
  high: { response: 4, resolution: 24 },
  urgent: { response: 1, resolution: 8 }
};

// Shift Timings
const SHIFT_TIMINGS = {
  MORNING: { start: '09:00', end: '17:00' },
  EVENING: { start: '14:00', end: '22:00' },
  NIGHT: { start: '22:00', end: '06:00' }
};

// Leave Types
const LEAVE_TYPES = {
  SICK: 'sick',
  CASUAL: 'casual',
  EARNED: 'earned',
  UNPAID: 'unpaid',
  EMERGENCY: 'emergency',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  BEREAVEMENT: 'bereavement'
};

// Geofence Shapes
const GEOFENCE_SHAPES = {
  CIRCLE: 'circle',
  POLYGON: 'polygon'
};

// Report Types
const REPORT_TYPES = {
  ATTENDANCE: 'attendance',
  COMPLAINT: 'complaint',
  FINANCIAL: 'financial',
  PERFORMANCE: 'performance',
  SLA: 'sla',
  INVENTORY: 'inventory',
  CUSTOM: 'custom'
};

// Export Formats
const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
};

// PPM Frequency
const PPM_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  HALF_YEARLY: 'half_yearly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// API Response Messages
const RESPONSE_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error'
};

module.exports = {
  USER_ROLES,
  TECHNICIAN_TYPES,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  TASK_STATUS,
  ATTENDANCE_STATUS,
  PAYMENT_STATUS,
  INVOICE_STATUS,
  APPROVAL_TYPES,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  SERVICE_CATEGORIES,
  SLA_PRIORITIES,
  SHIFT_TIMINGS,
  LEAVE_TYPES,
  GEOFENCE_SHAPES,
  REPORT_TYPES,
  EXPORT_FORMATS,
  PPM_FREQUENCY,
  HTTP_STATUS,
  RESPONSE_MESSAGES
};