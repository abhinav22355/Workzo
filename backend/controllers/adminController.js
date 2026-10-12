const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const ServiceCategory = require('../models/ServiceCategory');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @desc    Get Admin Dashboard KPI metrics and charts
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });

    const verifiedWorkers = await WorkerProfile.countDocuments({ verificationStatus: 'verified' });
    const pendingWorkers = await WorkerProfile.countDocuments({ verificationStatus: 'pending' });
    const rejectedWorkers = await WorkerProfile.countDocuments({ verificationStatus: 'rejected' });

    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'COMPLETED' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'CANCELLED' });
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'PENDING' });
    const activeBookings = await Booking.countDocuments({ bookingStatus: { $in: ['ACCEPTED', 'ON_THE_WAY', 'STARTED'] } });

    // Calculate revenue from completed bookings
    const completedBookingDocs = await Booking.find({ bookingStatus: 'COMPLETED' }).select('price');
    const totalRevenue = completedBookingDocs.reduce((acc, curr) => acc + (curr.price || 0), 0);

    // Popular services aggregation
    const serviceDistribution = await Booking.aggregate([
      { $group: { _id: '$serviceId', count: { $sum: 1 }, totalAmount: { $sum: '$price' } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const populatedServices = await ServiceCategory.populate(serviceDistribution, { path: '_id', select: 'name' });

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('customerId', 'name email')
      .populate('workerId', 'name email')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    // Bookings trend over months (or simulated monthly buckets for chart)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthlyData = [
      { month: 'May', bookings: 12, revenue: 5800 },
      { month: 'Jun', bookings: 19, revenue: 9400 },
      { month: 'Jul', bookings: 27, revenue: 14200 },
      { month: 'Aug', bookings: 38, revenue: 20500 },
      { month: 'Sep', bookings: 54, revenue: 31000 },
      { month: 'Oct', bookings: totalBookings, revenue: totalRevenue },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalWorkers,
        verifiedWorkers,
        pendingWorkers,
        rejectedWorkers,
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        activeBookings,
        totalRevenue,
      },
      popularServices: populatedServices.map((item) => ({
        name: item._id ? item._id.name : 'General Maintenance',
        count: item.count,
        totalAmount: item.totalAmount,
      })),
      recentBookings,
      monthlyData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active / Suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot suspend their own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workers list with verification filter
// @route   GET /api/admin/workers
// @access  Private (Admin)
const getWorkersAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.verificationStatus = status;

    const workers = await WorkerProfile.find(query)
      .populate('userId', 'name email phone profileImage address city isActive')
      .populate('serviceCategories', 'name')
      .sort({ createdAt: -1 });

    let filtered = workers;
    if (search) {
      const q = search.toLowerCase();
      filtered = workers.filter(
        (w) =>
          (w.userId && (w.userId.name.toLowerCase().includes(q) || w.userId.email.toLowerCase().includes(q))) ||
          w.profession.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or Reject Worker
// @route   PUT /api/admin/workers/:id/verify
// @access  Private (Admin)
const verifyWorker = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be verified, rejected, or pending' });
    }

    const worker = await WorkerProfile.findById(req.params.id).populate('userId');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    worker.verificationStatus = status;
    await worker.save();

    // Notify Worker
    if (worker.userId) {
      await Notification.create({
        userId: worker.userId._id,
        title: status === 'verified' ? 'Worker Profile Verified!' : 'Worker Verification Update',
        message:
          status === 'verified'
            ? 'Congratulations! Your profile has been verified. You can now receive customer bookings.'
            : 'Your worker verification application was rejected or requires updates. Please check your profile.',
        type: 'WORKER_VERIFICATION',
        link: '/worker/profile',
      });
    }

    res.status(200).json({
      success: true,
      message: `Worker verification status updated to ${status}`,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.bookingStatus = status;

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('workerId', 'name email phone')
      .populate('serviceId', 'name startingPrice')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private (Admin)
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('customerId', 'name email')
      .populate('workerId', 'name email')
      .populate('bookingId', 'serviceId price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for admin moderation
// @route   GET /api/admin/reviews
// @access  Private (Admin)
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name email profileImage')
      .populate('workerId', 'name email')
      .populate('bookingId', 'serviceId date')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getWorkersAdmin,
  verifyWorker,
  getAllBookings,
  getAllPayments,
  getAllReviews,
};
