const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getWorkersAdmin,
  verifyWorker,
  getAllBookings,
  getAllPayments,
  getAllReviews,
} = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/workers', getWorkersAdmin);
router.put('/workers/:id/verify', verifyWorker);
router.get('/bookings', getAllBookings);
router.get('/payments', getAllPayments);
router.get('/reviews', getAllReviews);

module.exports = router;
