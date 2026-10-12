const Review = require('../models/Review');
const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const Notification = require('../models/Notification');

// @desc    Submit review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user._id;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Booking ID, rating, and comment are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Rule 10: Only the customer associated with a booking can review it
    if (booking.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings.' });
    }

    // Rule 9: Only completed bookings can be reviewed
    if (booking.bookingStatus !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'You can only review a booking that has been marked as COMPLETED.' });
    }

    // Rule: Prevent duplicate review for the same booking
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    const review = await Review.create({
      bookingId,
      customerId,
      workerId: booking.workerId,
      rating: Number(rating),
      comment,
    });

    // Recalculate Worker's average rating & totalReviews
    const allReviews = await Review.find({ workerId: booking.workerId });
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0 ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 5.0;

    await WorkerProfile.findOneAndUpdate(
      { userId: booking.workerId },
      {
        rating: Number(avgRating),
        totalReviews,
      }
    );

    // Notify Worker
    await Notification.create({
      userId: booking.workerId,
      title: 'New Customer Review Received',
      message: `${req.user.name} rated your service ${rating} stars: "${comment.slice(0, 40)}..."`,
      type: 'REVIEW',
      link: `/worker/dashboard`,
    });

    const populatedReview = await Review.findById(review._id).populate('customerId', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
const getWorkerReviews = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const reviews = await Review.find({ workerId })
      .populate('customerId', 'name profileImage city')
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

// @desc    Delete review (Admin moderation)
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const workerId = review.workerId;
    await review.deleteOne();

    // Recalculate Worker's average rating & totalReviews
    const allReviews = await Review.find({ workerId });
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0 ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 5.0;

    await WorkerProfile.findOneAndUpdate(
      { userId: workerId },
      {
        rating: Number(avgRating),
        totalReviews,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getWorkerReviews,
  deleteReview,
};
