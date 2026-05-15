// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');

// router.use(protect);

// // Public building routes (accessible by authenticated users)
// router.get('/', (req, res) => {
//   res.json({ success: true, message: 'Get buildings' });
// });

// router.get('/:id', (req, res) => {
//   res.json({ success: true, message: 'Get building details' });
// });

// // Admin only routes
// router.post('/', authorize('super_admin'), (req, res) => {
//   res.json({ success: true, message: 'Building created' });
// });

// router.put('/:id', authorize('super_admin'), (req, res) => {
//   res.json({ success: true, message: 'Building updated' });
// });

// router.delete('/:id', authorize('super_admin'), (req, res) => {
//   res.json({ success: true, message: 'Building deleted' });
// });

// router.get('/:id/floors', (req, res) => {
//   res.json({ success: true, message: 'Get building floors' });
// });

// router.post('/:id/floors', authorize('super_admin'), (req, res) => {
//   res.json({ success: true, message: 'Floor added' });
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getBuildings,
  getBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingFloors,
  addFloor
} = require('../controllers/building.controller');

// All routes require authentication
router.use(protect);

// Public building routes (accessible by authenticated users)
router.get('/', getBuildings);
router.get('/:id', getBuilding);
router.get('/:id/floors', getBuildingFloors);

// Admin only routes
router.post('/', authorize('super_admin', 'manager'), createBuilding);
router.put('/:id', authorize('super_admin', 'manager'), updateBuilding);
router.delete('/:id', authorize('super_admin'), deleteBuilding);
router.post('/:id/floors', authorize('super_admin', 'manager'), addFloor);

module.exports = router;