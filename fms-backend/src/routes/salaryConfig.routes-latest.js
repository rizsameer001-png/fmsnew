const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createSalaryConfig,
  getSalaryConfigs,
  getSalaryConfigByCountry,
  updateSalaryConfig,
  deleteSalaryConfig,
  createDefaultConfigs
} = require('../controllers/salaryConfig.controller');

// All routes require authentication
router.use(protect);

// Public routes (accessible by authenticated users)
router.get('/', getSalaryConfigs);
router.get('/country/:country', getSalaryConfigByCountry);

// Admin only routes
router.post('/', authorize('super_admin'), createSalaryConfig);
router.post('/default/create', authorize('super_admin'), createDefaultConfigs);
router.put('/:id', authorize('super_admin'), updateSalaryConfig);
router.delete('/:id', authorize('super_admin'), deleteSalaryConfig);

module.exports = router;