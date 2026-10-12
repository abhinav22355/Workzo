const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Get workers with advanced filtering, search, and sorting
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res, next) => {
  try {
    const {
      serviceId,
      search,
      location,
      minRating,
      maxPrice,
      minExperience,
      availabilityDay,
      sort = 'recommended',
      all = 'false',
    } = req.query;

    const query = {};

    // Only verified workers by default
    if (all !== 'true') {
      query.verificationStatus = 'verified';
    }

    // Filter by service category
    if (serviceId) {
      query.serviceCategories = serviceId;
    }

    // Filter by rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by experience
    if (minExperience) {
      query.experience = { $gte: Number(minExperience) };
    }

    // Filter by max starting price
    if (maxPrice) {
      query['pricing.startingRate'] = { $lte: Number(maxPrice) };
    }

    // Filter by day availability
    if (availabilityDay) {
      query['availability.days'] = { $in: [availabilityDay] };
    }

    // Filter by location / service area
    if (location) {
      query.serviceArea = { $regex: location, $options: 'i' };
    }

    // Text search query across profession, description, skills, worker name, and service categories
    if (search) {
      const [matchingUsers, matchingCategories] = await Promise.all([
        User.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
        ServiceCategory.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
      ]);

      const userIds = matchingUsers.map((u) => u._id);
      const categoryIds = matchingCategories.map((c) => c._id);

      query.$or = [
        { profession: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { userId: { $in: userIds } },
        { serviceCategories: { $in: categoryIds } },
      ];
    }

    // Determine sorting
    let sortOptions = {};
    if (sort === 'highest_rated') {
      sortOptions = { rating: -1, totalReviews: -1 };
    } else if (sort === 'lowest_price') {
      sortOptions = { 'pricing.startingRate': 1 };
    } else if (sort === 'most_experienced') {
      sortOptions = { experience: -1 };
    } else {
      // 'recommended'
      sortOptions = { completedJobs: -1, rating: -1 };
    }

    const workers = await WorkerProfile.find(query)
      .populate({
        path: 'userId',
        select: 'name email phone profileImage city state address isActive',
        match: { isActive: true }, // Ensure active users
      })
      .populate('serviceCategories', 'name slug icon startingPrice')
      .sort(sortOptions);

    // Filter out workers whose user record is null (inactive users)
    const activeWorkers = workers.filter((w) => w.userId !== null);

    res.status(200).json({
      success: true,
      count: activeWorkers.length,
      data: activeWorkers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker profile by ID (WorkerProfile ID or User ID)
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res, next) => {
  try {
    let worker = await WorkerProfile.findById(req.params.id)
      .populate('userId', 'name email phone profileImage city state address isActive')
      .populate('serviceCategories', 'name slug icon startingPrice');

    // Also check if ID was a userId
    if (!worker) {
      worker = await WorkerProfile.findOne({ userId: req.params.id })
        .populate('userId', 'name email phone profileImage city state address isActive')
        .populate('serviceCategories', 'name slug icon startingPrice');
    }

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    // Fetch reviews for this worker
    const reviews = await Review.find({ workerId: worker.userId._id })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: worker,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private (Worker)
const updateWorkerProfile = async (req, res, next) => {
  try {
    let profile = await WorkerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const {
      profession,
      skills,
      experience,
      description,
      serviceCategories,
      serviceArea,
      pricing,
      availability,
    } = req.body;

    if (profession) profile.profession = profession;
    if (skills) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (experience !== undefined) profile.experience = Number(experience);
    if (description !== undefined) profile.description = description;
    if (serviceCategories) profile.serviceCategories = serviceCategories;
    if (serviceArea) profile.serviceArea = serviceArea;
    if (pricing) profile.pricing = { ...profile.pricing, ...pricing };
    if (availability) profile.availability = { ...profile.availability, ...availability };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booked slots for worker on a specific date
// @route   GET /api/workers/:id/availability
// @access  Public
const getWorkerAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    const workerProfile = await WorkerProfile.findById(req.params.id);
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    if (!date) {
      return res.status(200).json({
        success: true,
        availability: workerProfile.availability,
      });
    }

    // Find confirmed/active bookings on that date
    const bookedJobs = await Booking.find({
      workerId: workerProfile.userId,
      date,
      bookingStatus: { $in: ['ACCEPTED', 'ON_THE_WAY', 'STARTED'] },
    }).select('time bookingStatus');

    const bookedSlots = bookedJobs.map((b) => b.time);

    res.status(200).json({
      success: true,
      date,
      workingHours: workerProfile.availability.workingHours,
      workingDays: workerProfile.availability.days,
      isUnavailableDate: workerProfile.availability.unavailableDates.includes(date),
      bookedSlots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  updateWorkerProfile,
  getWorkerAvailability,
};
