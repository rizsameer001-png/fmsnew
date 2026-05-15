// const mongoose = require('mongoose');

// const roleSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Role name is required'],
//     unique: true,
//     trim: true,
//     enum: ['super_admin', 'manager', 'supervisor', 'technician', 'customer']
//   },
//   displayName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   permissions: [{
//     type: String,
//     enum: [
//       'view_users', 'create_users', 'edit_users', 'delete_users',
//       'view_buildings', 'create_buildings', 'edit_buildings', 'delete_buildings',
//       'view_complaints', 'assign_complaints', 'resolve_complaints', 'delete_complaints',
//       'view_tasks', 'create_tasks', 'assign_tasks', 'verify_tasks',
//       'view_attendance', 'mark_attendance', 'approve_attendance', 'export_attendance',
//       'view_invoices', 'create_invoices', 'process_payments', 'refund_payments',
//       'view_reports', 'export_reports', 'schedule_reports',
//       'view_settings', 'edit_settings', 'view_logs', 'manage_backup',
//       'view_roles', 'create_roles', 'edit_roles', 'delete_roles'
//     ]
//   }],
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Role', roleSchema);

// const mongoose = require('mongoose');

// const roleSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Role name is required'],
//     unique: true,
//     trim: true,
//     enum: ['super_admin', 'manager', 'supervisor', 'technician', 'customer']
//   },
//   displayName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   permissions: [{
//     type: String,
//     enum: [
//       // User permissions
//       'view_users', 'create_users', 'edit_users', 'delete_users',
//       // Building permissions
//       'view_buildings', 'create_buildings', 'edit_buildings', 'delete_buildings',
//       // Complaint permissions
//       'view_complaints', 'assign_complaints', 'resolve_complaints', 'delete_complaints',
//       // Task permissions
//       'view_tasks', 'create_tasks', 'assign_tasks', 'update_tasks', 'verify_tasks',
//       // Attendance permissions
//       'view_attendance', 'mark_attendance', 'approve_attendance', 'export_attendance',
//       // Billing permissions
//       'view_invoices', 'create_invoices', 'process_payments', 'refund_payments',
//       // Report permissions
//       'view_reports', 'export_reports', 'schedule_reports',
//       // System permissions
//       'view_settings', 'edit_settings', 'view_logs', 'manage_backup',
//       // Role permissions
//       'view_roles', 'create_roles', 'edit_roles', 'delete_roles'
//     ]
//   }],
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Role', roleSchema);



const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    enum: ['super_admin', 'manager', 'supervisor', 'technician', 'customer']
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [{
    type: String,
    enum: [
      // User permissions
      'view_users', 'create_users', 'edit_users', 'delete_users',
      // Building permissions
      'view_buildings', 'create_buildings', 'edit_buildings', 'delete_buildings',
      // Complaint permissions
      'view_complaints', 'assign_complaints', 'resolve_complaints', 'delete_complaints',
      // Task permissions
      'view_tasks', 'create_tasks', 'assign_tasks', 'update_tasks', 'verify_tasks',
      // Attendance permissions
      'view_attendance', 'mark_attendance', 'approve_attendance', 'export_attendance',
      // Billing permissions
      'view_invoices', 'create_invoices', 'process_payments', 'refund_payments', 'make_payments',  // ✅ ADDED 'make_payments'
      // Report permissions
      'view_reports', 'export_reports', 'schedule_reports',
      // System permissions
      'view_settings', 'edit_settings', 'view_logs', 'manage_backup',
      // Role permissions
      'view_roles', 'create_roles', 'edit_roles', 'delete_roles'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);