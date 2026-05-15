const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  generateSalary,
  getSalaries,
  getMySalary,
  approveSalary,
  markAsPaid,
  getMonthlyAttendance,
  bulkGenerateSalary
} = require('../controllers/salary.controller');

router.use(protect);

// Employee routes
router.get('/my', getMySalary);
router.get('/monthly-attendance', getMonthlyAttendance);

// Admin/Manager routes
router.get('/', authorize('super_admin', 'manager'), getSalaries);
router.post('/generate', authorize('super_admin', 'manager'), generateSalary);
router.post('/bulk-generate', authorize('super_admin'), bulkGenerateSalary);
router.put('/:id/approve', authorize('super_admin', 'manager'), approveSalary);
router.put('/:id/mark-paid', authorize('super_admin'), markAsPaid);

module.exports = router;