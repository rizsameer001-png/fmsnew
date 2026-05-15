const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createSalaryConfig,
  getSalaryConfigs,
  getSalaryConfigById,
  getSalaryConfigByCountry,
  updateSalaryConfig,
  deleteSalaryConfig,
  addEarningComponent,
  updateEarningComponent,
  deleteEarningComponent,
  addDeductionComponent,
  updateDeductionComponent,
  deleteDeductionComponent,
  createDefaultConfigs
} = require('../controllers/salaryConfig.controller');

router.use(protect);

// Main CRUD
router.get('/', getSalaryConfigs);
router.get('/:id', getSalaryConfigById);
router.get('/country/:country', getSalaryConfigByCountry);
router.post('/', authorize('super_admin'), createSalaryConfig);
router.post('/default/create', authorize('super_admin'), createDefaultConfigs);
router.put('/:id', authorize('super_admin'), updateSalaryConfig);
router.delete('/:id', authorize('super_admin'), deleteSalaryConfig);

// Earning Components Routes
router.post('/:id/earnings', authorize('super_admin'), addEarningComponent);
router.put('/:id/earnings/:componentId', authorize('super_admin'), updateEarningComponent);
router.delete('/:id/earnings/:componentId', authorize('super_admin'), deleteEarningComponent);

// Deduction Components Routes
router.post('/:id/deductions', authorize('super_admin'), addDeductionComponent);
router.put('/:id/deductions/:componentId', authorize('super_admin'), updateDeductionComponent);
router.delete('/:id/deductions/:componentId', authorize('super_admin'), deleteDeductionComponent);

module.exports = router;