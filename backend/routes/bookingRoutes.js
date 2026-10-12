const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  processPayment,
} = require('../controllers/bookingController');
const { requireAuth, requireCustomer } = require('../middleware/authMiddleware');

router.post('/', requireAuth, requireCustomer, createBooking);
router.get('/', requireAuth, getBookings);
router.get('/:id', requireAuth, getBookingById);
router.put('/:id/status', requireAuth, updateBookingStatus);
router.post('/:id/payment', requireAuth, processPayment);

module.exports = router;
