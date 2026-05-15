const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  generateSalary,
  bulkGenerateSalary,
  getSalaries,
  getMySalary,
  getSalaryById,
  approveSalary,
  markAsPaid,
  getMonthlyAttendance,
  updateSalaryComponents,
  deleteSalary,
  exportSalaryToExcel,  // ✅ NEW
  exportSalarySlip,      // ✅ NEW
  sendSalarySlipToEmployee,     // ✅ ADD THIS
  sendBulkSalarySlipsEmail      // ✅ ADD THIS
} = require('../controllers/salary.controller');
const {
  createSalaryConfig,
  getSalaryConfigs,
  getSalaryConfigByCountry,
  updateSalaryConfig,
  deleteSalaryConfig,
  createDefaultConfigs
} = require('../controllers/salaryConfig.controller');

router.use(protect);

// ==================== SALARY CONFIGURATION ROUTES ====================
router.get('/configs', authorize('super_admin'), getSalaryConfigs);
router.get('/configs/:country', getSalaryConfigByCountry);
router.post('/configs', authorize('super_admin'), createSalaryConfig);
router.put('/configs/:id', authorize('super_admin'), updateSalaryConfig);
router.delete('/configs/:id', authorize('super_admin'), deleteSalaryConfig);
router.post('/configs/default/create', authorize('super_admin'), createDefaultConfigs);

// ==================== SALARY GENERATION ROUTES ====================
router.post('/generate', authorize('super_admin', 'manager'), generateSalary);
router.post('/bulk-generate', authorize('super_admin'), bulkGenerateSalary);

// ==================== SALARY VIEW ROUTES ====================
router.get('/my', getMySalary);
router.get('/', authorize('super_admin', 'manager'), getSalaries);
router.get('/:id', authorize('super_admin', 'manager'), getSalaryById);

// ==================== EXPORT ROUTES ====================
router.get('/export/excel', authorize('super_admin', 'manager'), exportSalaryToExcel);
router.get('/:id/export-slip', authorize('super_admin', 'manager'), exportSalarySlip);

// ==================== SALARY UPDATE ROUTES ====================
router.put('/:id/approve', authorize('super_admin', 'manager'), approveSalary);
router.put('/:id/mark-paid', authorize('super_admin'), markAsPaid);
router.put('/:id/update', authorize('super_admin'), updateSalaryComponents);
router.delete('/:id', authorize('super_admin'), deleteSalary);

// ==================== ATTENDANCE FOR SALARY ====================
router.get('/monthly-attendance', getMonthlyAttendance);

// ==================== SALARY slip Email ====================

// Email routes
router.post('/:id/send-email', authorize('super_admin', 'manager'), sendSalarySlipToEmployee);
router.post('/bulk-send-email', authorize('super_admin'), sendBulkSalarySlipsEmail);

module.exports = router;