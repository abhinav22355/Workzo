const ServiceCategory = require('../models/ServiceCategory');

// @desc    Get all active service categories (or all for admin)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };

    const services = await ServiceCategory.find(filter).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service category
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await ServiceCategory.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }
    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service category
// @route   POST /api/services
// @access  Private (Admin)
const createService = async (req, res, next) => {
  try {
    const { name, description, icon, startingPrice, isActive = true } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await ServiceCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Service with this name already exists' });
    }

    const service = await ServiceCategory.create({
      name,
      slug,
      description,
      icon: icon || 'Wrench',
      startingPrice: Number(startingPrice) || 199,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: 'Service category created successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service category
// @route   PUT /api/services/:id
// @access  Private (Admin)
const updateService = async (req, res, next) => {
  try {
    const service = await ServiceCategory.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }

    const { name, description, icon, startingPrice, isActive } = req.body;
    if (name) {
      service.name = name;
      service.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) service.description = description;
    if (icon !== undefined) service.icon = icon;
    if (startingPrice !== undefined) service.startingPrice = Number(startingPrice);
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service category updated successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service category
// @route   DELETE /api/services/:id
// @access  Private (Admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await ServiceCategory.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
