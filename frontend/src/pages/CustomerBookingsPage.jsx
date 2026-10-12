import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  AlertCircle,
  Star,
  XCircle,
  Eye,
  CheckCircle,
  Truck,
  Play,
  CheckCheck,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import BookingStatusBadge from '../components/BookingStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import RatingStars from '../components/RatingStars';
import { useToast } from '../context/ToastContext';

const CustomerBookingsPage = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Cancel Modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Changed plans');

  // Review Modal state
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await bookingService.getBookings({ tab: activeTab === 'all' ? undefined : activeTab });
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => fetchBookings(true), 8000); // 8s polling
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    try {
      await bookingService.updateBookingStatus(cancellingBooking._id, 'CANCELLED', {
        cancellationReason: cancelReason,
      });
      addToast('Booking cancelled successfully', 'info');
      setCancellingBooking(null);
      fetchBookings(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingBooking || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        bookingId: reviewingBooking._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      addToast('Thank you! Your review was submitted successfully.', 'success');
      setReviewingBooking(null);
      setReviewComment('');
      fetchBookings(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'active', label: 'Active (In Progress)' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Service Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track current appointments, monitor worker acceptance, view job histories, and rate professionals
          </p>
        </div>

        <Link
          to="/workers"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm self-start sm:self-auto"
        >
          Book Another Service
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings in this tab"
          description="You don't have any appointments matching this category right now."
          actionText="Browse Available Pros"
          onAction={() => (window.location.href = '/workers')}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const canCancel = ['PENDING', 'ACCEPTED'].includes(booking.bookingStatus);
            const canReview = booking.bookingStatus === 'COMPLETED';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={booking.workerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.workerId?.name}`}
                      alt="Worker"
                      className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {booking.workerId?.name}
                      </h3>
                      <p className="text-xs text-brand-600 font-semibold mt-0.5">
                        {booking.serviceId?.name || 'Home Service'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <BookingStatusBadge status={booking.bookingStatus} />
                    <BookingStatusBadge status={booking.paymentStatus} type="payment" />
                  </div>
                </div>

                {/* Status Notice Callout */}
                {booking.bookingStatus === 'ACCEPTED' && (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3.5 py-2 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Specialist Accepted! {booking.workerId?.name} confirmed this booking for {booking.date} at {booking.time}.</span>
                  </div>
                )}

                {booking.bookingStatus === 'PENDING' && (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-3.5 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Booking requested — Waiting for {booking.workerId?.name} to accept your request.</span>
                  </div>
                )}

                {booking.bookingStatus === 'ON_THE_WAY' && (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200/70 px-3.5 py-2 rounded-xl">
                    <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>{booking.workerId?.name} is on the way to your location.</span>
                  </div>
                )}

                {booking.bookingStatus === 'STARTED' && (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200/70 px-3.5 py-2 rounded-xl">
                    <Play className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Service is currently underway at your address.</span>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>{booking.date} at {booking.time}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{booking.address}, {booking.city}</span>
                  </div>

                  <div className="flex items-center space-x-2 sm:justify-end">
                    <span className="font-semibold text-slate-400">Total:</span>
                    <span className="text-sm font-black text-slate-900">₹{booking.price}</span>
                  </div>
                </div>

                {/* Problem snippet */}
                <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Requirement: </span>
                  {booking.description}
                </div>

                {/* Actions Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                  <Link
                    to={`/bookings/${booking._id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details & Timeline</span>
                  </Link>

                  {canCancel && (
                    <button
                      onClick={() => setCancellingBooking(booking)}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {canReview && (
                    <button
                      onClick={() => setReviewingBooking(booking)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Rate & Review</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Cancel Booking</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel booking #{cancellingBooking._id.slice(-6)} with{' '}
              {cancellingBooking.workerId?.name}?
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
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Rate Your Service</h3>
            <div className="flex justify-center py-2">
              <RatingStars rating={reviewRating} interactive={true} size="lg" onRate={(r) => setReviewRating(r)} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Feedback comment</label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this professional..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReviewingBooking(null)}
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
    </div>
  );
};

export default CustomerBookingsPage;
