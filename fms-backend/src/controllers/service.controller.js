const Service = require('../models/Service.model');
const ActivityLog = require('../models/ActivityLog.model');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, isActive, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query).sort('name');

    res.json({ success: true, services });
  } catch (error) {
    logger.error('Get services error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, service });
  } catch (error) {
    logger.error('Get service error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { name, category, description, basePrice, gstRate, slaResponseTime, slaResolutionTime, checklist } = req.body;

    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ success: false, message: 'Service already exists' });
    }

    const service = await Service.create({
      name,
      category,
      description,
      basePrice,
      gstRate,
      slaResponseTime,
      slaResolutionTime,
      checklist: checklist || []
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_SERVICE',
      entityType: 'service',
      entityId: service._id,
      newData: { name, category, basePrice },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    logger.error('Create service error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_SERVICE',
      entityType: 'service',
      entityId: service._id,
      newData: req.body,
      ipAddress: req.ip
    });

    res.json({ success: true, service });
  } catch (error) {
    logger.error('Update service error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await service.deleteOne();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE_SERVICE',
      entityType: 'service',
      entityId: req.params.id,
      oldData: { name: service.name },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    logger.error('Delete service error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get service categories
// @route   GET /api/services/categories/list
// @access  Public
const getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle service status
// @route   PUT /api/services/:id/toggle
// @access  Private/Admin
const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json({ success: true, service });
  } catch (error) {
    logger.error('Toggle service error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
  toggleServiceStatus
};