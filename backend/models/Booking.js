const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Service/problem description is required'],
    },
    date: {
      type: String,
      required: [true, 'Service date is required (YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Service time is required'],
    },
    address: {
      type: String,
      required: [true, 'Service address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
    },
    serviceCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    bookingFee: {
      type: Number,
      default: 50,
    },
    price: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['CASH_AFTER_SERVICE', 'RAZORPAY_ONLINE'],
      default: 'CASH_AFTER_SERVICE',
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'ON_THE_WAY', 'STARTED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    customerNotes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index to prevent worker double bookings on the same date and time slot
bookingSchema.index({ workerId: 1, date: 1, time: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
