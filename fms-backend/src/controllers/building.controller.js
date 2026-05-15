// const Building = require('../models/Building.model');
// const Floor = require('../models/Floor.model');
// const ZoneRoom = require('../models/ZoneRoom.model');
// const ActivityLog = require('../models/ActivityLog.model');
// //const logger = require('../utils/logger');
// // Replace with:
// const { logger } = require('../utils/logger');

// // @desc    Get all buildings
// // @route   GET /api/buildings
// // @access  Private
// const getBuildings = async (req, res) => {
//   try {
//     const { status, search } = req.query;
//     const query = {};
    
//     if (status) query.status = status;
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { code: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const buildings = await Building.find(query)
//       .populate('managerId', 'name email phone')
//       .sort('name');

//     res.json({ success: true, buildings });
//   } catch (error) {
//     logger.error('Get buildings error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get single building
// // @route   GET /api/buildings/:id
// // @access  Private
// const getBuilding = async (req, res) => {
//   try {
//     const building = await Building.findById(req.params.id)
//       .populate('managerId', 'name email phone');
    
//     if (!building) {
//       return res.status(404).json({ success: false, message: 'Building not found' });
//     }

//     const floors = await Floor.find({ buildingId: building._id });
//     const zones = await ZoneRoom.find({ buildingId: building._id });

//     res.json({ success: true, building, floors, zones });
//   } catch (error) {
//     logger.error('Get building error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Create building
// // @route   POST /api/buildings
// // @access  Private/Admin
// const createBuilding = async (req, res) => {
//   try {
//     const { name, code, address, managerId, totalFloors, totalArea, constructionYear } = req.body;

//     const existingBuilding = await Building.findOne({ $or: [{ name }, { code }] });
//     if (existingBuilding) {
//       return res.status(400).json({ success: false, message: 'Building name or code already exists' });
//     }

//     const building = await Building.create({
//       name,
//       code: code.toUpperCase(),
//       address,
//       managerId,
//       totalFloors,
//       totalArea,
//       constructionYear
//     });

//     await ActivityLog.create({
//       userId: req.user._id,
//       userName: req.user.name,
//       userRole: req.user.role,
//       action: 'CREATE_BUILDING',
//       entityType: 'building',
//       entityId: building._id,
//       newData: { name, code },
//       ipAddress: req.ip
//     });

//     res.status(201).json({ success: true, building });
//   } catch (error) {
//     logger.error('Create building error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Update building
// // @route   PUT /api/buildings/:id
// // @access  Private/Admin
// const updateBuilding = async (req, res) => {
//   try {
//     const building = await Building.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!building) {
//       return res.status(404).json({ success: false, message: 'Building not found' });
//     }

//     await ActivityLog.create({
//       userId: req.user._id,
//       userName: req.user.name,
//       userRole: req.user.role,
//       action: 'UPDATE_BUILDING',
//       entityType: 'building',
//       entityId: building._id,
//       newData: req.body,
//       ipAddress: req.ip
//     });

//     res.json({ success: true, building });
//   } catch (error) {
//     logger.error('Update building error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Delete building
// // @route   DELETE /api/buildings/:id
// // @access  Private/Admin
// const deleteBuilding = async (req, res) => {
//   try {
//     const building = await Building.findById(req.params.id);
//     if (!building) {
//       return res.status(404).json({ success: false, message: 'Building not found' });
//     }

//     // Check if building has floors or zones
//     const floorCount = await Floor.countDocuments({ buildingId: building._id });
//     if (floorCount > 0) {
//       return res.status(400).json({ success: false, message: 'Cannot delete building with existing floors' });
//     }

//     await building.deleteOne();

//     await ActivityLog.create({
//       userId: req.user._id,
//       userName: req.user.name,
//       userRole: req.user.role,
//       action: 'DELETE_BUILDING',
//       entityType: 'building',
//       entityId: req.params.id,
//       oldData: { name: building.name },
//       ipAddress: req.ip
//     });

//     res.json({ success: true, message: 'Building deleted successfully' });
//   } catch (error) {
//     logger.error('Delete building error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get building floors
// // @route   GET /api/buildings/:id/floors
// // @access  Private
// const getBuildingFloors = async (req, res) => {
//   try {
//     const floors = await Floor.find({ buildingId: req.params.id }).sort('floorNumber');
//     res.json({ success: true, floors });
//   } catch (error) {
//     logger.error('Get building floors error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Add floor to building
// // @route   POST /api/buildings/:id/floors
// // @access  Private/Admin
// const addFloor = async (req, res) => {
//   try {
//     const { floorNumber, name, totalRooms, totalArea } = req.body;
    
//     const floor = await Floor.create({
//       buildingId: req.params.id,
//       floorNumber,
//       name,
//       totalRooms,
//       totalArea
//     });

//     await Building.findByIdAndUpdate(req.params.id, { $inc: { totalFloors: 1 } });

//     res.status(201).json({ success: true, floor });
//   } catch (error) {
//     logger.error('Add floor error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = {
//   getBuildings,
//   getBuilding,
//   createBuilding,
//   updateBuilding,
//   deleteBuilding,
//   getBuildingFloors,
//   addFloor
// };


const Building = require('../models/Building.model');
const Floor = require('../models/Floor.model');
const ZoneRoom = require('../models/ZoneRoom.model');
const ActivityLog = require('../models/ActivityLog.model');
const { logger } = require('../utils/logger');

// @desc    Get all buildings
// @route   GET /api/buildings
// @access  Private
const getBuildings = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const buildings = await Building.find(query)
      .populate('managerId', 'name email phone')
      .sort('name');

    res.json({ success: true, buildings });
  } catch (error) {
    logger.error('Get buildings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single building
// @route   GET /api/buildings/:id
// @access  Private
const getBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .populate('managerId', 'name email phone');
    
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    const floors = await Floor.find({ buildingId: building._id });
    const zones = await ZoneRoom.find({ buildingId: building._id });

    res.json({ success: true, building, floors, zones });
  } catch (error) {
    logger.error('Get building error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create building
// @route   POST /api/buildings
// @access  Private/Admin
const createBuilding = async (req, res) => {
  try {
    const { name, code, address, managerId, totalFloors, totalArea, constructionYear } = req.body;

    const existingBuilding = await Building.findOne({ $or: [{ name }, { code }] });
    if (existingBuilding) {
      return res.status(400).json({ success: false, message: 'Building name or code already exists' });
    }

    const building = await Building.create({
      name,
      code: code.toUpperCase(),
      address,
      managerId,
      totalFloors: totalFloors || 0,
      totalArea: totalArea || 0,
      constructionYear
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_BUILDING',
      entityType: 'building',
      entityId: building._id,
      newData: { name, code },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, building });
  } catch (error) {
    logger.error('Create building error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update building
// @route   PUT /api/buildings/:id
// @access  Private/Admin
const updateBuilding = async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_BUILDING',
      entityType: 'building',
      entityId: building._id,
      newData: req.body,
      ipAddress: req.ip
    });

    res.json({ success: true, building });
  } catch (error) {
    logger.error('Update building error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete building
// @route   DELETE /api/buildings/:id
// @access  Private/Admin
const deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    // Check if building has floors or zones
    const floorCount = await Floor.countDocuments({ buildingId: building._id });
    if (floorCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete building with existing floors. Please delete floors first.' 
      });
    }

    await building.deleteOne();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE_BUILDING',
      entityType: 'building',
      entityId: req.params.id,
      oldData: { name: building.name },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Building deleted successfully' });
  } catch (error) {
    logger.error('Delete building error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get building floors
// @route   GET /api/buildings/:id/floors
// @access  Private
const getBuildingFloors = async (req, res) => {
  try {
    const floors = await Floor.find({ buildingId: req.params.id }).sort('floorNumber');
    res.json({ success: true, floors });
  } catch (error) {
    logger.error('Get building floors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add floor to building
// @route   POST /api/buildings/:id/floors
// @access  Private/Admin
const addFloor = async (req, res) => {
  try {
    const { floorNumber, name, totalRooms, totalArea } = req.body;
    
    const floor = await Floor.create({
      buildingId: req.params.id,
      floorNumber,
      name,
      totalRooms,
      totalArea
    });

    await Building.findByIdAndUpdate(req.params.id, { $inc: { totalFloors: 1 } });

    res.status(201).json({ success: true, floor });
  } catch (error) {
    logger.error('Add floor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBuildings,
  getBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingFloors,
  addFloor
};