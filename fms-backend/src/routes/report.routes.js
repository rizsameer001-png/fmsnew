


// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');
// const {
//   getAnalytics,
//   generateAttendanceReport,
//   generateComplaintReport,
//   generateFinancialReport,
//   generatePerformanceReport,
//   exportToExcel,
//   exportToPDF,
//   exportReport,
//   getActivityLogs,
//   getServiceHistory,
//   getSLAMetrics,
//   // ⬇️⬇️⬇️ ADD THESE INSPECTION CONTROLLER FUNCTIONS ⬇️⬇️⬇️
//   getInspections,
//   createInspection,
//   getInspection,
//   updateInspection,
//   deleteInspection
// } = require('../controllers/report.controller');

// // ==================== DEBUG ROUTES ====================
// // ✅ Test if routes file is loaded
// router.get('/debug', (req, res) => {
//   console.log('🔍 Debug route accessed');
//   res.json({ 
//     success: true, 
//     message: 'Report routes are working!',
//     timestamp: new Date().toISOString(),
//     availableEndpoints: [
//       'GET /debug',
//       'GET /analytics',
//       'POST /export',
//       'POST /export/excel',
//       'POST /export/pdf',
//       'POST /attendance',
//       'POST /complaint',
//       'POST /financial',
//       'POST /performance',
//       'GET /activity-logs',
//       'GET /service-history',
//       'GET /sla-metrics',
//       // ⬇️⬇️⬇️ ADD INSPECTION ENDPOINTS TO LIST ⬇️⬇️⬇️
//       'GET /inspections',
//       'POST /inspections',
//       'GET /inspections/:id',
//       'PUT /inspections/:id',
//       'DELETE /inspections/:id'
//     ]
//   });
// });

// // ✅ Test if controller functions are loaded
// router.get('/debug/controllers', (req, res) => {
//   console.log('🔍 Debug controllers check');
//   const controllers = {
//     getAnalytics: typeof getAnalytics === 'function',
//     exportReport: typeof exportReport === 'function',
//     exportToExcel: typeof exportToExcel === 'function',
//     exportToPDF: typeof exportToPDF === 'function',
//     generateAttendanceReport: typeof generateAttendanceReport === 'function',
//     generateComplaintReport: typeof generateComplaintReport === 'function',
//     generateFinancialReport: typeof generateFinancialReport === 'function',
//     generatePerformanceReport: typeof generatePerformanceReport === 'function',
//     getActivityLogs: typeof getActivityLogs === 'function',
//     getServiceHistory: typeof getServiceHistory === 'function',
//     getSLAMetrics: typeof getSLAMetrics === 'function',
//     // ⬇️⬇️⬇️ ADD INSPECTION CONTROLLER CHECKS ⬇️⬇️⬇️
//     getInspections: typeof getInspections === 'function',
//     createInspection: typeof createInspection === 'function',
//     getInspection: typeof getInspection === 'function',
//     updateInspection: typeof updateInspection === 'function',
//     deleteInspection: typeof deleteInspection === 'function'
//   };
  
//   const allLoaded = Object.values(controllers).every(v => v === true);
  
//   res.json({
//     success: true,
//     allControllersLoaded: allLoaded,
//     controllers: controllers
//   });
// });

// // ✅ Simple test endpoint without authentication
// router.get('/test', (req, res) => {
//   console.log('🔍 Test route accessed - no auth required');
//   res.json({ 
//     success: true, 
//     message: 'Report routes test endpoint is working!',
//     timestamp: new Date().toISOString()
//   });
// });

// // ==================== MAIN ROUTES ====================

// // All main routes require authentication
// router.use(protect);

// // Analytics - allow super_admin, admin, manager
// router.get('/analytics', authorize('super_admin', 'admin', 'manager'), getAnalytics);

// // Export routes
// router.post('/export', authorize('super_admin', 'admin'), exportReport);
// router.post('/export/excel', authorize('super_admin', 'admin'), exportToExcel);
// router.post('/export/pdf', authorize('super_admin', 'admin'), exportToPDF);

// // Report generation
// router.post('/attendance', authorize('super_admin', 'admin', 'manager'), generateAttendanceReport);
// router.post('/complaint', authorize('super_admin', 'admin', 'manager'), generateComplaintReport);
// router.post('/financial', authorize('super_admin', 'admin'), generateFinancialReport);
// //router.post('/performance', authorize('super_admin', 'admin', 'manager'), generatePerformanceReport);
// // To this (add 'supervisor'):
// router.post('/performance', authorize('super_admin', 'admin', 'manager', 'supervisor'), generatePerformanceReport)

// // Other routes
// router.get('/activity-logs', authorize('super_admin', 'admin'), getActivityLogs);
// router.get('/service-history', authorize('customer'), getServiceHistory);
// router.get('/sla-metrics', authorize('manager', 'super_admin'), getSLAMetrics);

// // ==================== INSPECTION ROUTES ====================
// // ⬇️⬇️⬇️ ADD THESE INSPECTION ROUTES ⬇️⬇️⬇️
// router.get('/inspections', authorize('super_admin', 'admin', 'manager', 'supervisor'), getInspections);
// router.post('/inspections', authorize('supervisor'), createInspection);
// router.get('/inspections/:id', authorize('super_admin', 'admin', 'manager', 'supervisor'), getInspection);
// router.put('/inspections/:id', authorize('supervisor', 'manager'), updateInspection);
// router.delete('/inspections/:id', authorize('supervisor', 'manager'), deleteInspection);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getAnalytics,
  generateAttendanceReport,
  generateComplaintReport,
  generateFinancialReport,
  generatePerformanceReport,
  exportToExcel,
  exportToPDF,
  exportReport,
  getActivityLogs,
  getServiceHistory,
  getSLAMetrics,
  getInspections,
  createInspection,
  getInspection,
  updateInspection,
  deleteInspection
} = require('../controllers/report.controller');

// ==================== DEBUG ROUTES ====================
router.get('/debug', (req, res) => {
  console.log('🔍 Debug route accessed');
  res.json({ 
    success: true, 
    message: 'Report routes are working!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /debug',
      'GET /analytics',
      'POST /export',
      'POST /export/excel',
      'POST /export/pdf',
      'POST /attendance',
      'POST /complaint',
      'POST /financial',
      'POST /performance',
      'GET /activity-logs',
      'GET /service-history',
      'GET /sla-metrics',
      'GET /inspections',
      'POST /inspections',
      'GET /inspections/:id',
      'PUT /inspections/:id',
      'DELETE /inspections/:id'
    ]
  });
});

router.get('/debug/controllers', (req, res) => {
  console.log('🔍 Debug controllers check');
  const controllers = {
    getAnalytics: typeof getAnalytics === 'function',
    exportReport: typeof exportReport === 'function',
    exportToExcel: typeof exportToExcel === 'function',
    exportToPDF: typeof exportToPDF === 'function',
    generateAttendanceReport: typeof generateAttendanceReport === 'function',
    generateComplaintReport: typeof generateComplaintReport === 'function',
    generateFinancialReport: typeof generateFinancialReport === 'function',
    generatePerformanceReport: typeof generatePerformanceReport === 'function',
    getActivityLogs: typeof getActivityLogs === 'function',
    getServiceHistory: typeof getServiceHistory === 'function',
    getSLAMetrics: typeof getSLAMetrics === 'function',
    getInspections: typeof getInspections === 'function',
    createInspection: typeof createInspection === 'function',
    getInspection: typeof getInspection === 'function',
    updateInspection: typeof updateInspection === 'function',
    deleteInspection: typeof deleteInspection === 'function'
  };
  
  const allLoaded = Object.values(controllers).every(v => v === true);
  
  res.json({
    success: true,
    allControllersLoaded: allLoaded,
    controllers: controllers
  });
});

router.get('/test', (req, res) => {
  console.log('🔍 Test route accessed - no auth required');
  res.json({ 
    success: true, 
    message: 'Report routes test endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// ==================== MAIN ROUTES ====================

// All main routes require authentication
router.use(protect);

// Analytics - allow super_admin, admin, manager
router.get('/analytics', authorize('super_admin', 'admin', 'manager'), getAnalytics);

// Export routes
// router.post('/export', authorize('super_admin', 'admin'), exportReport);
// router.post('/export/excel', authorize('super_admin', 'admin'), exportToExcel);
// router.post('/export/pdf', authorize('super_admin', 'admin'), exportToPDF);

// ⬇️⬇️⬇️ TO THIS ⬇️⬇️⬇️ Allow manager to export
router.post('/export', authorize('super_admin', 'admin', 'manager'), exportReport);
router.post('/export/excel', authorize('super_admin', 'admin', 'manager'), exportToExcel);
router.post('/export/pdf', authorize('super_admin', 'admin', 'manager'), exportToPDF);

// Report generation
router.post('/attendance', authorize('super_admin', 'admin', 'manager', 'supervisor'), generateAttendanceReport);
router.post('/complaint', authorize('super_admin', 'admin', 'manager', 'supervisor'), generateComplaintReport);
router.post('/financial', authorize('super_admin', 'admin'), generateFinancialReport);
// ⬇️⬇️⬇️ FIXED: Added 'supervisor' to performance report ⬇️⬇️⬇️
router.post('/performance', authorize('super_admin', 'admin', 'manager', 'supervisor'), generatePerformanceReport);

// Other routes
router.get('/activity-logs', authorize('super_admin', 'admin'), getActivityLogs);
router.get('/service-history', authorize('customer'), getServiceHistory);
router.get('/sla-metrics', authorize('manager', 'super_admin'), getSLAMetrics);

// Inspection routes
router.get('/inspections', authorize('super_admin', 'admin', 'manager', 'supervisor'), getInspections);
router.post('/inspections', authorize('supervisor'), createInspection);
router.get('/inspections/:id', authorize('super_admin', 'admin', 'manager', 'supervisor'), getInspection);
router.put('/inspections/:id', authorize('supervisor', 'manager'), updateInspection);
router.delete('/inspections/:id', authorize('supervisor', 'manager'), deleteInspection);

module.exports = router;