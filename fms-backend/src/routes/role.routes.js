const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  getPermissionsList
} = require('../controllers/role.controller');

// All routes require authentication
router.use(protect);
router.use(authorize('super_admin'));

router.get('/', getRoles);
router.get('/permissions', getPermissionsList);
router.get('/:id', getRole);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
router.put('/:id/toggle', toggleRoleStatus);

module.exports = router;