import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Star,
  CreditCard,
  ArrowLeft,
  Truck,
  Play,
  CheckCheck,
  XCircle,
  User,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookingStatusBadge from '../components/BookingStatusBadge';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomerBookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  // Worker Decline modal
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('Schedule conflict / unavailable');

  // Customer Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed plans');

  // Payment processing state
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchBooking = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await bookingService.getBookingById(id);
      setBooking(res.data);
      setWorkerProfile(res.workerProfile);

      // Check if user already reviewed
      if (res.data.bookingStatus === 'COMPLETED' && res.data.workerId) {
        const revRes = await reviewService.getWorkerReviews(res.data.workerId._id || res.data.workerId);
        const myRev = (revRes.data || []).find((r) => r.bookingId?._id === id || r.bookingId === id);
        if (myRev) setExistingReview(myRev);
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(() => fetchBooking(true), 6000); // 6s polling for live timeline update
    return () => clearInterval(interval);
  }, [id]);

  const handleWorkerStatusUpdate = async (newStatus, extra = {}) => {
    setActionInProgress(true);
    try {
      await bookingService.updateBookingStatus(id, newStatus, extra);
      if (newStatus === 'ACCEPTED') {
        addToast('Booking accepted! The customer has been notified.', 'success');
      } else if (newStatus === 'REJECTED') {
        addToast('Booking request declined.', 'info');
      } else if (newStatus === 'ON_THE_WAY') {
        addToast('Status updated: You are on the way to the location.', 'success');
      } else if (newStatus === 'STARTED') {
        addToast('Service marked as started on-site.', 'success');
      } else if (newStatus === 'COMPLETED') {
        addToast('Service completed successfully!', 'success');
      } else {
        addToast(`Status updated to ${newStatus}`, 'success');
      }
      fetchBooking(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update booking status', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCustomerCancel = async () => {
    setActionInProgress(true);
    try {
      await bookingService.updateBookingStatus(id, 'CANCELLED', {
        cancellationReason: cancelReason,
      });
      addToast('Booking cancelled.', 'info');
      setCancelModalOpen(false);
      fetchBooking(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePayNow = async (method = 'CASH_AFTER_SERVICE') => {
    setProcessingPayment(true);
    try {
      await bookingService.processPayment(booking._id, {
        paymentMethod: method,
        razorpayPaymentId: method === 'RAZORPAY_ONLINE' ? 'pay_rzp_' + Date.now() : undefined,
      });
      addToast(`Payment of ₹${booking.price} successfully recorded!`, 'success');
      fetchBooking(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to process payment', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        bookingId: booking._id,
        rating,
        comment,
      });
      addToast('Review submitted! Thank you.', 'success');
      setShowReviewModal(false);
      fetchBooking(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading booking timeline..." />;
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Booking not found</h2>
        <Link to="/bookings" className="mt-4 inline-block text-brand-600 font-bold text-xs">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const isWorker =
    user?.role === 'worker' ||
    (user?._id && booking.workerId?._id && user._id.toString() === booking.workerId._id.toString());

  // Visual Progression Stages
  const stages = [
    { key: 'PENDING', title: 'Booking Requested', desc: 'Customer placed request' },
    { key: 'ACCEPTED', title: 'Worker Accepted', desc: 'Specialist accepted appointment' },
    { key: 'ON_THE_WAY', title: 'Worker On The Way', desc: 'Dispatched to location' },
    { key: 'STARTED', title: 'Service Started', desc: 'Repair work commenced' },
    { key: 'COMPLETED', title: 'Service Completed', desc: 'Work finished satisfactorily' },
  ];

  const statusOrder = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'STARTED', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(booking.bookingStatus);
  const isCancelled = ['CANCELLED', 'REJECTED'].includes(booking.bookingStatus);
  const canCustomerCancel = !isWorker && ['PENDING', 'ACCEPTED'].includes(booking.bookingStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back link */}
      <div className="flex items-center justify-between">
        <Link
          to={isWorker ? '/worker/bookings' : '/bookings'}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          {isWorker ? 'Back to Worker Bookings' : 'Back to My Bookings'}
        </Link>

        <span className="text-xs font-semibold text-slate-400">
          Booking ID: <strong className="text-slate-700">#{booking._id}</strong>
        </span>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Service Appointment
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            {booking.serviceId?.name || 'Home Maintenance'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled for <strong>{booking.date}</strong> at <strong>{booking.time}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <BookingStatusBadge status={booking.bookingStatus} />
          <BookingStatusBadge status={booking.paymentStatus} type="payment" />
          {canCustomerCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* WORKER ACTION PANEL (Visible to Worker) */}
      {isWorker && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                Worker Controls & Actions
              </span>
              <h3 className="text-lg font-bold text-white">
                {booking.bookingStatus === 'PENDING' && 'New Request: Customer Waiting for Acceptance'}
                {booking.bookingStatus === 'ACCEPTED' && 'Booking Accepted — Ready to Dispatch'}
                {booking.bookingStatus === 'ON_THE_WAY' && 'You Are En Route to Customer Location'}
                {booking.bookingStatus === 'STARTED' && 'Service in Progress On-Site'}
                {booking.bookingStatus === 'COMPLETED' && 'Job Completed Successfully'}
                {booking.bookingStatus === 'REJECTED' && 'You Declined this Booking Request'}
                {booking.bookingStatus === 'CANCELLED' && 'Booking Was Cancelled'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {booking.bookingStatus === 'PENDING' && (
                <>
                  <button
                    disabled={actionInProgress}
                    onClick={() => setDeclineModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-rose-400/40 text-rose-300 hover:bg-rose-950/40 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline Request</span>
                  </button>
                  <button
                    disabled={actionInProgress}
                    onClick={() => handleWorkerStatusUpdate('ACCEPTED')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>{actionInProgress ? 'Accepting...' : 'Accept Booking Now'}</span>
                  </button>
                </>
              )}

              {booking.bookingStatus === 'ACCEPTED' && (
                <button
                  disabled={actionInProgress}
                  onClick={() => handleWorkerStatusUpdate('ON_THE_WAY')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-lg transition flex items-center space-x-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>{actionInProgress ? 'Updating...' : 'Mark On The Way'}</span>
                </button>
              )}

              {booking.bookingStatus === 'ON_THE_WAY' && (
                <button
                  disabled={actionInProgress}
                  onClick={() => handleWorkerStatusUpdate('STARTED')}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold shadow-lg transition flex items-center space-x-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span>{actionInProgress ? 'Updating...' : 'Start Job (On-Site)'}</span>
                </button>
              )}

              {booking.bookingStatus === 'STARTED' && (
                <button
                  disabled={actionInProgress}
                  onClick={() => handleWorkerStatusUpdate('COMPLETED')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center space-x-1.5"
                >
                  <CheckCheck className="w-4 h-4 text-slate-950" />
                  <span>{actionInProgress ? 'Updating...' : 'Mark Service Completed'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER STATUS CALLOUT (Visible to Customer) */}
      {!isWorker && (
        <>
          {booking.bookingStatus === 'PENDING' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3.5">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">Booking Request Sent — Awaiting Specialist Acceptance</h4>
                <p className="text-xs text-amber-700">
                  We have forwarded your booking request to <strong>{booking.workerId?.name}</strong>. Once they accept your appointment, this status will automatically change to Confirmed.
                </p>
              </div>
            </div>
          )}

          {booking.bookingStatus === 'ACCEPTED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start space-x-3.5 shadow-sm">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">🎉 Booking Confirmed! Specialist Has Accepted Your Request</h4>
                <p className="text-xs text-blue-700">
                  <strong>{booking.workerId?.name}</strong> has confirmed your booking for{' '}
                  <strong>{booking.date} at {booking.time}</strong>. You will receive an alert as soon as they head to your address.
                </p>
              </div>
            </div>
          )}

          {booking.bookingStatus === 'ON_THE_WAY' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start space-x-3.5">
              <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">Specialist Is On The Way</h4>
                <p className="text-xs text-indigo-700">
                  <strong>{booking.workerId?.name}</strong> has departed and is currently traveling to your location.
                </p>
              </div>
            </div>
          )}

          {booking.bookingStatus === 'STARTED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-start space-x-3.5">
              <Play className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">Service In Progress</h4>
                <p className="text-xs text-purple-700">
                  <strong>{booking.workerId?.name}</strong> is currently on-site performing your requested service.
                </p>
              </div>
            </div>
          )}

          {booking.bookingStatus === 'COMPLETED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3.5">
              <CheckCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">Service Successfully Completed!</h4>
                <p className="text-xs text-emerald-700">
                  The service work is done. Please confirm payment and share your rating and review for the worker below.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Visual Timeline Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900">Booking Timeline Progress</h3>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">This booking was {booking.bookingStatus.toLowerCase()}</p>
              <p className="text-[11px] mt-0.5 text-rose-600">{booking.cancellationReason || 'No reason provided'}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {stages.map((stage, idx) => {
                const isPassed = currentIndex >= idx;
                const isCurrent = currentIndex === idx;

                return (
                  <div key={stage.key} className="flex sm:flex-col items-center sm:text-center space-x-3 sm:space-x-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isPassed
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="sm:mt-2">
                      <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-brand-600' : 'text-slate-700'}`}>
                        {stage.title}
                      </p>
                      <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Timeline Events */}
        {booking.timeline && booking.timeline.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Log</h4>
            <div className="space-y-2">
              {booking.timeline.map((evt, i) => (
                <div key={i} className="text-xs flex items-center justify-between text-slate-600 p-2.5 rounded-xl bg-slate-50">
                  <span className="font-semibold text-slate-800">{evt.note || evt.status}</span>
                  <span className="text-[11px] text-slate-400">{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Worker / Customer Info & Price Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Card: If Worker, show Customer details. If Customer, show Worker details */}
        {isWorker ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Customer Details</h3>

            <div className="flex items-center space-x-4">
              <img
                src={booking.customerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.customerId?.name}`}
                alt="Customer"
                className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{booking.customerId?.name}</h4>
                <p className="text-xs text-slate-500">Service Recipient</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{booking.customerId?.phone || 'Phone not provided'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{booking.customerId?.email}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Requirement:</span>
              <p>{booking.description}</p>
              {booking.customerNotes && (
                <p className="text-[11px] text-slate-500 italic mt-1">
                  Customer Notes: {booking.customerNotes}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assigned Professional</h3>

            <div className="flex items-center space-x-4">
              <img
                src={booking.workerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.workerId?.name}`}
                alt="Worker"
                className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{booking.workerId?.name}</h4>
                <p className="text-xs text-brand-600 font-semibold">{workerProfile?.profession || 'Specialist'}</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <RatingStars rating={workerProfile?.rating || 4.9} size="sm" />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{booking.workerId?.phone || '+91 97111 01001'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{booking.workerId?.email}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Requirement: </span>
              {booking.description}
            </div>
          </div>
        )}

        {/* Address & Payment Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Payment & Location</h3>

            <div className="text-xs text-slate-600 flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">{booking.address}</p>
                <p className="text-slate-400">{booking.city} - {booking.pincode}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Service Charge:</span>
                <span>₹{booking.serviceCharge}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Booking Fee:</span>
                <span>₹{booking.bookingFee}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount:</span>
                <span className="text-brand-600">₹{booking.price}</span>
              </div>
            </div>
          </div>

          {/* Payment Actions (Customer only) */}
          {!isWorker && booking.bookingStatus === 'COMPLETED' && booking.paymentStatus === 'PENDING' && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-800">Job Finished. Settle Payment:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={processingPayment}
                  onClick={() => handlePayNow('CASH_AFTER_SERVICE')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  Confirm Cash Paid
                </button>
                <button
                  disabled={processingPayment}
                  onClick={() => handlePayNow('RAZORPAY_ONLINE')}
                  className="py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
                >
                  Pay with Razorpay
                </button>
              </div>
            </div>
          )}

          {/* Review Action (Customer only) */}
          {!isWorker && booking.bookingStatus === 'COMPLETED' && !existingReview && (
            <div className="pt-2">
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Rate & Review Professional</span>
              </button>
            </div>
          )}

          {!isWorker && existingReview && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 space-y-1">
              <span className="font-bold">Your Review:</span>
              <RatingStars rating={existingReview.rating} size="sm" />
              <p className="italic">"{existingReview.comment}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal (Customer) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Rate Your Service Experience</h3>
            <div className="flex justify-center py-2">
              <RatingStars rating={rating} interactive={true} size="lg" onRate={(r) => setRating(r)} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Feedback comment</label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your satisfaction with the worker's punctuality and quality..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={submittingReview}
                onClick={handleReviewSubmit}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal (Worker) */}
      {declineModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Decline Booking Request</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to decline this booking request from <strong>{booking.customerId?.name}</strong>?
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason for declining</label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Schedule conflict / unavailable">Schedule conflict / unavailable</option>
                <option value="Outside service coverage area">Outside service coverage area</option>
                <option value="Required tools/parts unavailable">Required tools/parts unavailable</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeclineModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={actionInProgress}
                onClick={async () => {
                  await handleWorkerStatusUpdate('REJECTED', { note: declineReason });
                  setDeclineModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Cancel Booking</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this booking with {booking.workerId?.name}?
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Changed plans / reschedule needed">Changed plans / reschedule needed</option>
                <option value="Issue resolved independently">Issue resolved independently</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Found alternative solution">Found alternative solution</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                disabled={actionInProgress}
                onClick={handleCustomerCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookingDetailPage;
