// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const morgan = require('morgan');
// const path = require('path');
// const rateLimit = require('express-rate-limit');
// //new
// const leaveRoutes = require('./routes/leave.routes');
// //const attendanceRoutes = require('./routes/attendance.routes');

// // ✅ IMPORT ALL MODELS FIRST - This fixes the Building model error
// // require('./models/User.model');
// // require('./models/Building.model');
// // require('./models/Service.model');
// // // Add this with your other model imports
// // require('./models/Role.model');
// // //
// // require('./models/Inspection.model');
// // ✅ NEW - Import Leave, Attendance, Salary models
// require('./models/Attendance.model');
// require('./models/Leave.model');
// require('./models/LeaveBalance.model');
// require('./models/Salary.model');
// require('./models/Complaint.model');
// require('./models/Task.model');
// require('./models/Invoice.model');
// require('./models/Payment.model');
// require('./models/Chat.model');
// require('./models/Notification.model');
// require('./models/PPM_Schedule.model');
// require('./models/Approval.model');
// require('./models/Report.model');
// require('./models/ActivityLog.model');
// require('./models/Shift.model');
// require('./models/Geofence.model');
// require('./models/Holiday.model');
// require('./models/ZoneRoom.model');
// require('./models/Floor.model');
// require('./models/SLAPolicy.model');

// // ✅ NEW - Import all required models (existing ones)
// require('./models/User.model');
// require('./models/Building.model');
// require('./models/Service.model');
// require('./models/Role.model');
// require('./models/Inspection.model');
// require('./models/SalaryConfig.model');  // ✅ NEW - Salary Config Model


// // Import routes
// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const adminRoutes = require('./routes/admin.routes');
// const managerRoutes = require('./routes/manager.routes');
// const supervisorRoutes = require('./routes/supervisor.routes');
// const technicianRoutes = require('./routes/technician.routes');
// const customerRoutes = require('./routes/customer.routes');
// const buildingRoutes = require('./routes/building.routes');
// const serviceRoutes = require('./routes/service.routes');
// const taskRoutes = require('./routes/task.routes');
// const complaintRoutes = require('./routes/complaint.routes');
// const attendanceRoutes = require('./routes/attendance.routes');
// const invoiceRoutes = require('./routes/invoice.routes');
// const paymentRoutes = require('./routes/payment.routes');
// const chatRoutes = require('./routes/chat.routes');
// const notificationRoutes = require('./routes/notification.routes');
// const ppmRoutes = require('./routes/ppm.routes');
// const approvalRoutes = require('./routes/approval.routes');
// const reportRoutes = require('./routes/report.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');
// const gpsRoutes = require('./routes/gps.routes');

// // Add this with your other route imports
// const roleRoutes = require('./routes/role.routes');
// const salaryConfigRoutes = require('./routes/salaryConfig.routes');  // ✅ NEW - Salary Config Routes



// //const { errorHandler } = require('./utils/errorHandler');
// //const { logger, morganStream } = require('./utils/logger');
// //const logger = require('./utils/logger'); // ✅ FIXED (no destructuring)
// // ✅ NEW - Import Attendance, Leave, Salary routes
// //const attendanceRoutes = require('./routes/attendance.routes');
// //const leaveRoutes = require('./routes/leave.routes');
// const salaryRoutes = require('./routes/salary.routes');

// const { errorHandler } = require('./utils/errorHandler');
// const { logger, morganStream } = require('./utils/logger');


// const app = express();

// // Security middleware
// app.use(helmet());

// // CORS configuration
// app.use(cors({
//   origin: process.env.WEB_URL || 'http://localhost:5173',
//   credentials: true
// }));

// // Compression
// app.use(compression());

// // Logging - use morgan with custom stream
// app.use(morgan('combined', { stream: morganStream }));

// // Rate limiting
// // const limiter = rateLimit({
// //   windowMs: 15 * 60 * 1000, // 15 minutes
// //   max: 100, // limit each IP to 100 requests per windowMs
// //   message: 'Too many requests from this IP, please try again later.'
// // });

// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute (changed from 15 minutes)
//   max: 300, // limit each IP to 300 requests per windowMs (increased from 100)
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Add this with your other app.use statements
// app.use('/api/roles', roleRoutes);

// // Static files
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// app.use('/logs', express.static(path.join(__dirname, '../logs')));

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/manager', managerRoutes);
// app.use('/api/supervisor', supervisorRoutes);
// app.use('/api/technician', technicianRoutes);
// app.use('/api/customer', customerRoutes);
// app.use('/api/buildings', buildingRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/complaints', complaintRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/chats', chatRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/ppm', ppmRoutes);
// app.use('/api/approvals', approvalRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/gps', gpsRoutes);
// // Add after other routes
// //app.use('/api/leaves', leaveRoutes);
// // ✅ NEW - Attendance, Leave, Salary Routes
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/leaves', leaveRoutes);
// app.use('/api/salaries', salaryRoutes);
// app.use('/api/salary-config', salaryConfigRoutes);  // ✅ NEW - Salary Config Routes


// // Health check
// //app.get('/health', (req, res) => {
//   //res.status(200).json({ status: 'OK', timestamp: new Date() });
// //});

// /* ================= HEALTH CHECK ================= */
// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'FMS Backend is running',
//     timestamp: new Date()
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // Error handler
// app.use(errorHandler);

// module.exports = app;



require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// ==================== IMPORT ALL MODELS ====================
require('./models/User.model');
require('./models/Building.model');
require('./models/Service.model');
require('./models/Role.model');
require('./models/Inspection.model');
require('./models/Attendance.model');
require('./models/Leave.model');
require('./models/LeaveBalance.model');
require('./models/Salary.model');
require('./models/SalaryConfig.model');  // ✅ NEW - Salary Config Model
require('./models/Complaint.model');
require('./models/Task.model');
require('./models/Invoice.model');
require('./models/Payment.model');
require('./models/Chat.model');
require('./models/Notification.model');
require('./models/PPM_Schedule.model');
require('./models/Approval.model');
require('./models/Report.model');
require('./models/ActivityLog.model');
require('./models/Shift.model');
require('./models/Geofence.model');
require('./models/Holiday.model');
require('./models/ZoneRoom.model');
require('./models/Floor.model');
require('./models/SLAPolicy.model');

// ==================== IMPORT ROUTES ====================
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const managerRoutes = require('./routes/manager.routes');
const supervisorRoutes = require('./routes/supervisor.routes');
const technicianRoutes = require('./routes/technician.routes');
const customerRoutes = require('./routes/customer.routes');
const buildingRoutes = require('./routes/building.routes');
const serviceRoutes = require('./routes/service.routes');
const taskRoutes = require('./routes/task.routes');
const complaintRoutes = require('./routes/complaint.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');
const salaryRoutes = require('./routes/salary.routes');
const salaryConfigRoutes = require('./routes/salaryConfig.routes');  // ✅ NEW - Salary Config Routes
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');
const ppmRoutes = require('./routes/ppm.routes');
const approvalRoutes = require('./routes/approval.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const gpsRoutes = require('./routes/gps.routes');
const roleRoutes = require('./routes/role.routes');

const { errorHandler } = require('./utils/errorHandler');
const { logger, morganStream } = require('./utils/logger');

const app = express();

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet());

// ==================== CORS CONFIGURATION ====================
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ==================== COMPRESSION ====================
app.use(compression());

// ==================== LOGGING ====================
app.use(morgan('combined', { stream: morganStream }));

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ==================== BODY PARSING ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/logs', express.static(path.join(__dirname, '../logs')));

// ==================== API ROUTES ====================

// Authentication
app.use('/api/auth', authRoutes);

// User Management
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Building & Service
app.use('/api/buildings', buildingRoutes);
app.use('/api/services', serviceRoutes);

// Tasks & Complaints
app.use('/api/tasks', taskRoutes);
app.use('/api/complaints', complaintRoutes);

// Attendance, Leave & Salary
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/salary-config', salaryConfigRoutes);  // ✅ NEW - Salary Config Routes

// Billing
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);

// Communication
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// PPM & Approvals
app.use('/api/ppm', ppmRoutes);
app.use('/api/approvals', approvalRoutes);

// Reports & Dashboard
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// GPS Tracking
app.use('/api/gps', gpsRoutes);

// Role-based Portals
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/customer', customerRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FMS Backend is running',
    timestamp: new Date(),
    modules: {
      attendance: true,
      leave: true,
      salary: true,
      salaryConfig: true  // ✅ NEW
    }
  });
});

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Facility Management System API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      buildings: '/api/buildings',
      services: '/api/services',
      tasks: '/api/tasks',
      complaints: '/api/complaints',
      attendance: '/api/attendance',
      leaves: '/api/leaves',
      salaries: '/api/salaries',
      salaryConfig: '/api/salary-config',  // ✅ NEW
      invoices: '/api/invoices',
      payments: '/api/payments',
      chats: '/api/chats',
      notifications: '/api/notifications',
      ppm: '/api/ppm',
      approvals: '/api/approvals',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
      gps: '/api/gps',
      admin: '/api/admin',
      manager: '/api/manager',
      supervisor: '/api/supervisor',
      technician: '/api/technician',
      customer: '/api/customer',
      health: '/api/health'
    }
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.originalUrl}` 
  });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

module.exports = app;