const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res, next) => {
  try {
    const {
      workerId, // This can be WorkerProfile _id or User _id
      serviceId,
      description,
      date,
      time,
      address,
      city,
      pincode,
      customerNotes = '',
      paymentMethod = 'CASH_AFTER_SERVICE',
    } = req.body;

    const customerId = req.user._id;

    // Validate required fields
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service is required for this booking.',
      });
    }

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Service date and time slot are required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Service/problem description is required.',
      });
    }

    if (!address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Service address, city, and pincode are required.',
      });
    }

    // Resolve worker profile and target user with populated serviceCategories
    let workerProfile = await WorkerProfile.findById(workerId)
      .populate('userId')
      .populate('serviceCategories');
    if (!workerProfile) {
      workerProfile = await WorkerProfile.findOne({ userId: workerId })
        .populate('userId')
        .populate('serviceCategories');
    }

    if (!workerProfile || !workerProfile.userId) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    const workerUser = workerProfile.userId;

    // Rule 2: Only verified workers can receive bookings
    if (workerProfile.verificationStatus !== 'verified') {
      return res.status(400).json({ success: false, message: 'This worker is currently not verified for bookings.' });
    }

    // Rule 3: Workers cannot book themselves
    if (workerUser._id.toString() === customerId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot book yourself.' });
    }

    // Rule 13: Suspended users cannot create or accept bookings
    if (!workerUser.isActive) {
      return res.status(400).json({ success: false, message: 'This worker is currently inactive.' });
    }

    // Validate that service exists in database
    const serviceCategory = await ServiceCategory.findById(serviceId);
    if (!serviceCategory) {
      return res.status(400).json({
        success: false,
        message: 'Selected service does not exist.',
      });
    }

    // Validate that service is active
    if (!serviceCategory.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected service is currently inactive.',
      });
    }

    // Validate worker-service relationship: selected worker must offer this service
    const workerCategoryIds = (workerProfile.serviceCategories || []).map((cat) =>
      (cat._id ? cat._id : cat).toString()
    );

    if (
      workerCategoryIds.length > 0 &&
      !workerCategoryIds.includes(serviceCategory._id.toString())
    ) {
      return res.status(400).json({
        success: false,
        message: `The selected worker does not provide the "${serviceCategory.name}" service.`,
      });
    }

    // Rule 4: Prevent double booking with the same worker on same date and time
    const existingCustomerBooking = await Booking.findOne({
      customerId,
      workerId: workerUser._id,
      date,
      time,
      bookingStatus: { $nin: ['CANCELLED', 'REJECTED'] },
    });

    if (existingCustomerBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking with this worker for this date and time slot.',
      });
    }

    // Rule 5: Worker cannot have an overlapping confirmed booking
    const overlappingWorkerBooking = await Booking.findOne({
      workerId: workerUser._id,
      date,
      time,
      bookingStatus: { $in: ['ACCEPTED', 'ON_THE_WAY', 'STARTED'] },
    });

    if (overlappingWorkerBooking) {
      return res.status(400).json({
        success: false,
        message: 'The selected worker is already booked for this specific time slot. Please choose another time.',
      });
    }

    // Calculate pricing
    const serviceCharge = workerProfile.pricing.startingRate || 299;
    const bookingFee = 50;
    const price = serviceCharge + bookingFee;

    const booking = await Booking.create({
      customerId,
      workerId: workerUser._id,
      serviceId: serviceCategory._id,
      description,
      date,
      time,
      address,
      city,
      pincode,
      serviceCharge,
      bookingFee,
      price,
      paymentMethod,
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      customerNotes,
      timeline: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note: 'Booking requested by customer',
        },
      ],
    });

    // Notify Worker
    await Notification.create({
      userId: workerUser._id,
      title: 'New Service Request Received',
      message: `${req.user.name} has requested your service for ${date} at ${time}.`,
      type: 'BOOKING_UPDATE',
      link: `/worker/bookings/${booking._id}`,
    });

    // Notify Customer
    await Notification.create({
      userId: customerId,
      title: 'Booking Requested Successfully',
      message: `Your booking with ${workerUser.name} has been placed and is waiting for confirmation.`,
      type: 'BOOKING_UPDATE',
      link: `/bookings/${booking._id}`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone profileImage address city')
      .populate('workerId', 'name email phone profileImage')
      .populate('serviceId', 'name slug icon startingPrice');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for logged in user (customer or worker)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const { status, tab } = req.query;
    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'worker') {
      query.workerId = req.user._id;
    }

    // Tab based filtering
    if (tab === 'upcoming') {
      query.bookingStatus = { $in: ['PENDING', 'ACCEPTED'] };
    } else if (tab === 'active') {
      query.bookingStatus = { $in: ['ON_THE_WAY', 'STARTED'] };
    } else if (tab === 'completed') {
      query.bookingStatus = 'COMPLETED';
    } else if (tab === 'cancelled') {
      query.bookingStatus = { $in: ['CANCELLED', 'REJECTED'] };
    } else if (status) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone profileImage address city')
      .populate('workerId', 'name email phone profileImage')
      .populate('serviceId', 'name slug icon startingPrice')
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

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone profileImage address city')
      .populate('workerId', 'name email phone profileImage')
      .populate('serviceId', 'name slug icon startingPrice');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check: Must be customer, worker, or admin
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isWorker = booking.workerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking' });
    }

    // Fetch worker profile details for extra context
    const workerProfile = await WorkerProfile.findOne({ userId: booking.workerId._id });

    res.status(200).json({
      success: true,
      data: booking,
      workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Accept, Reject, On The Way, Start, Complete, Cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason, note } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isWorker = booking.workerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this booking' });
    }

    // Customer cancellation rules
    if (status === 'CANCELLED') {
      if (!isCustomer && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only customer or admin can cancel this booking.' });
      }

      if (['COMPLETED', 'STARTED'].includes(booking.bookingStatus)) {
        return res.status(400).json({ success: false, message: 'Cannot cancel a booking that has already started or completed.' });
      }

      booking.bookingStatus = 'CANCELLED';
      booking.cancellationReason = cancellationReason || 'Cancelled by customer';
      booking.timeline.push({
        status: 'CANCELLED',
        timestamp: new Date(),
        note: booking.cancellationReason,
      });

      await booking.save();

      // Notify Worker
      await Notification.create({
        userId: booking.workerId,
        title: 'Booking Cancelled',
        message: `Booking for ${booking.date} at ${booking.time} was cancelled by the customer.`,
        type: 'BOOKING_UPDATE',
        link: `/worker/bookings/${booking._id}`,
      });

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    }

    // Worker status progression rules
    if (isWorker || isAdmin) {
      if (status === 'ACCEPTED') {
        if (booking.bookingStatus !== 'PENDING') {
          return res.status(400).json({ success: false, message: 'Can only accept pending bookings.' });
        }
        booking.bookingStatus = 'ACCEPTED';
        booking.timeline.push({
          status: 'ACCEPTED',
          timestamp: new Date(),
          note: note || 'Worker accepted the booking request',
        });

        // Notify Customer
        await Notification.create({
          userId: booking.customerId,
          title: 'Booking Confirmed!',
          message: 'The worker has accepted your booking request.',
          type: 'BOOKING_UPDATE',
          link: `/bookings/${booking._id}`,
        });
      } else if (status === 'REJECTED') {
        if (booking.bookingStatus !== 'PENDING') {
          return res.status(400).json({ success: false, message: 'Can only reject pending bookings.' });
        }
        booking.bookingStatus = 'REJECTED';
        booking.cancellationReason = note || 'Rejected by worker';
        booking.timeline.push({
          status: 'REJECTED',
          timestamp: new Date(),
          note: booking.cancellationReason,
        });

        // Notify Customer
        await Notification.create({
          userId: booking.customerId,
          title: 'Booking Request Declined',
          message: 'The worker was unavailable and declined the request. Please choose another professional.',
          type: 'BOOKING_UPDATE',
          link: `/bookings/${booking._id}`,
        });
      } else if (status === 'ON_THE_WAY') {
        if (booking.bookingStatus !== 'ACCEPTED') {
          return res.status(400).json({ success: false, message: 'Worker must accept the booking before departing.' });
        }
        booking.bookingStatus = 'ON_THE_WAY';
        booking.timeline.push({
          status: 'ON_THE_WAY',
          timestamp: new Date(),
          note: note || 'Worker is on the way to the location',
        });

        // Notify Customer
        await Notification.create({
          userId: booking.customerId,
          title: 'Worker Is On The Way',
          message: 'Your service professional has dispatched and is on the way to your address.',
          type: 'BOOKING_UPDATE',
          link: `/bookings/${booking._id}`,
        });
      } else if (status === 'STARTED') {
        if (!['ACCEPTED', 'ON_THE_WAY'].includes(booking.bookingStatus)) {
          return res.status(400).json({ success: false, message: 'Booking must be accepted/dispatched before starting.' });
        }
        booking.bookingStatus = 'STARTED';
        booking.timeline.push({
          status: 'STARTED',
          timestamp: new Date(),
          note: note || 'Service work has commenced',
        });

        // Notify Customer
        await Notification.create({
          userId: booking.customerId,
          title: 'Service Started',
          message: 'The worker has started the service at your location.',
          type: 'BOOKING_UPDATE',
          link: `/bookings/${booking._id}`,
        });
      } else if (status === 'COMPLETED') {
        // Rule 11: A booking cannot be marked completed before it is started
        if (booking.bookingStatus !== 'STARTED') {
          return res.status(400).json({ success: false, message: 'A booking cannot be marked completed before it is started.' });
        }
        booking.bookingStatus = 'COMPLETED';
        booking.timeline.push({
          status: 'COMPLETED',
          timestamp: new Date(),
          note: note || 'Service completed successfully',
        });

        // Increment worker's completed jobs
        await WorkerProfile.findOneAndUpdate(
          { userId: booking.workerId },
          { $inc: { completedJobs: 1 } }
        );

        // Notify Customer for review & payment
        await Notification.create({
          userId: booking.customerId,
          title: 'Service Completed!',
          message: 'Your service is complete. Please complete payment and rate your professional.',
          type: 'BOOKING_UPDATE',
          link: `/bookings/${booking._id}`,
        });
      } else {
        return res.status(400).json({ success: false, message: `Invalid status transition to ${status}.` });
      }

      await booking.save();

      const updated = await Booking.findById(booking._id)
        .populate('customerId', 'name email phone profileImage address city')
        .populate('workerId', 'name email phone profileImage')
        .populate('serviceId', 'name slug icon startingPrice');

      return res.status(200).json({
        success: true,
        message: `Booking status updated to ${status}`,
        data: updated,
      });
    }

    return res.status(403).json({ success: false, message: 'Unauthorized action' });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment for booking (Cash / simulated Razorpay)
// @route   POST /api/bookings/:id/payment
// @access  Private (Customer or Worker)
const processPayment = async (req, res, next) => {
  try {
    const { paymentMethod = 'CASH_AFTER_SERVICE', razorpayPaymentId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.paymentStatus = 'PAID';
    booking.paymentMethod = paymentMethod;
    booking.timeline.push({
      status: 'PAID',
      timestamp: new Date(),
      note: `Payment of ₹${booking.price} received via ${paymentMethod === 'RAZORPAY_ONLINE' ? 'Razorpay' : 'Cash on Service'}`,
    });

    await booking.save();

    // Create Payment Record
    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: booking.customerId,
      workerId: booking.workerId,
      amount: booking.price,
      paymentMethod,
      status: 'PAID',
      razorpayPaymentId: razorpayPaymentId || '',
    });

    // Notify both parties
    await Notification.create({
      userId: booking.customerId,
      title: 'Payment Confirmed',
      message: `Your payment of ₹${booking.price} for booking #${booking._id.toString().slice(-6)} has been recorded.`,
      type: 'PAYMENT',
      link: `/bookings/${booking._id}`,
    });

    await Notification.create({
      userId: booking.workerId,
      title: 'Payment Received',
      message: `Payment of ₹${booking.price} recorded for booking #${booking._id.toString().slice(-6)}.`,
      type: 'PAYMENT',
      link: `/worker/bookings/${booking._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        booking,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  processPayment,
};
