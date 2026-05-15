// Socket event names
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',
  
  // Room management
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  JOINED_ROOM: 'joined_room',
  LEFT_ROOM: 'left_room',
  
  // Chat events
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  CHAT_JOINED: 'chat_joined',
  CHAT_LEFT: 'chat_left',
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  MARK_READ: 'mark_read',
  MESSAGES_READ: 'messages_read',
  DELETE_MESSAGE: 'delete_message',
  EDIT_MESSAGE: 'edit_message',
  
  // Notification events
  SEND_NOTIFICATION: 'send_notification',
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_DELETED: 'notification_deleted',
  
  // Location events
  UPDATE_LOCATION: 'update_location',
  TECHNICIAN_LOCATION: 'technician_location',
  LOCATION_UPDATED: 'location_updated',
  GET_ALL_LOCATIONS: 'get_all_locations',
  ALL_LOCATIONS: 'all_locations',
  SUBSCRIBE_LOCATIONS: 'subscribe_locations',
  UNSUBSCRIBE_LOCATIONS: 'unsubscribe_locations',
  
  // Complaint events
  NEW_COMPLAINT: 'new_complaint',
  COMPLAINT_ASSIGNED: 'complaint_assigned',
  COMPLAINT_UPDATED: 'complaint_updated',
  COMPLAINT_RESOLVED: 'complaint_resolved',
  COMPLAINT_ESCALATED: 'complaint_escalated',
  SUBSCRIBE_COMPLAINT: 'subscribe_complaint',
  UNSUBSCRIBE_COMPLAINT: 'unsubscribe_complaint',
  
  // Task events
  NEW_TASK: 'new_task',
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_VERIFIED: 'task_verified',
  
  // Attendance events
  CHECKIN: 'checkin',
  CHECKOUT: 'checkout',
  ATTENDANCE_UPDATED: 'attendance_updated',
  
  // User status events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_STATUS_CHANGE: 'user_status_change',
  
  // Emergency events
  EMERGENCY_ALERT: 'emergency_alert',
  EMERGENCY_RESPONDED: 'emergency_responded',
  
  // Dashboard events
  DASHBOARD_STATS: 'dashboard_stats',
  SUBSCRIBE_DASHBOARD: 'subscribe_dashboard',
  UNSUBSCRIBE_DASHBOARD: 'unsubscribe_dashboard',
  
  // Geofence events
  GEOFENCE_ALERT: 'geofence_alert',
  GEOFENCE_BOUNDARY_CROSS: 'geofence_boundary_cross',
  
  // SLA events
  SLA_BREACH: 'sla_breach',
  SLA_BREACH_ESCALATION: 'sla_breach_escalation',
  
  // PPM events
  PPM_TASK_GENERATED: 'ppm_task_generated',
  PPM_REMINDER: 'ppm_reminder',
  
  // Invoice/Payment events
  INVOICE_GENERATED: 'invoice_generated',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  
  // System events
  SYSTEM_ALERT: 'system_alert',
  MAINTENANCE_MODE: 'maintenance_mode',
  FORCE_LOGOUT: 'force_logout',
  
  // Error events
  ERROR: 'error',
};

// Socket event payload types
export const SOCKET_PAYLOAD_TYPES = {
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
  LOCATION: 'location',
  COMPLAINT: 'complaint',
  TASK: 'task',
  ATTENDANCE: 'attendance',
  ALERT: 'alert',
};

// Socket rooms
export const SOCKET_ROOMS = {
  USER: (userId) => `user_${userId}`,
  ROLE: (role) => `role_${role}`,
  CHAT: (chatId) => `chat_${chatId}`,
  COMPLAINT: (complaintId) => `complaint_${complaintId}`,
  DASHBOARD: (type) => `dashboard_${type}`,
  NOTIFICATIONS: (userId) => `notifications_${userId}`,
  BUILDING: (buildingId) => `building_${buildingId}`,
};

// Helper to emit socket event with acknowledgment
export const emitWithAck = (socket, event, data, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeout);
    
    socket.emit(event, data, (response) => {
      clearTimeout(timeoutId);
      resolve(response);
    });
  });
};

// Helper to listen to socket event once
export const once = (socket, event, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeout);
    
    socket.once(event, (data) => {
      clearTimeout(timeoutId);
      resolve(data);
    });
  });
};

export default {
  SOCKET_EVENTS,
  SOCKET_PAYLOAD_TYPES,
  SOCKET_ROOMS,
  emitWithAck,
  once,
};