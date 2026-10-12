import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Truck,
  Play,
  CheckCheck,
  IndianRupee,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

const WorkerBookingsPage = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionInProgress, setActionInProgress] = useState(null);

  // Decline Modal state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [decliningBooking, setDecliningBooking] = useState(null);
  const [declineReason, setDeclineReason] = useState('Schedule conflict / unavailable');

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load worker bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 8000); // 8s polling
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, status, extra = {}) => {
    setActionInProgress(id);
    try {
      await bookingService.updateBookingStatus(id, status, extra);
      if (status === 'ACCEPTED') {
        addToast('Booking accepted! The customer has been notified.', 'success');
      } else if (status === 'REJECTED') {
        addToast('Booking request declined.', 'info');
      } else {
        addToast(`Status updated: ${status.replace('_', ' ')}`, 'success');
      }
      fetchBookings();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmDecline = async () => {
    if (!decliningBooking) return;
    await handleUpdateStatus(decliningBooking._id, 'REJECTED', { note: declineReason });
    setDeclineModalOpen(false);
    setDecliningBooking(null);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'pending') return b.bookingStatus === 'PENDING';
    if (activeTab === 'active') return ['ACCEPTED', 'ON_THE_WAY', 'STARTED'].includes(b.bookingStatus);
    if (activeTab === 'completed') return b.bookingStatus === 'COMPLETED';
    if (activeTab === 'cancelled') return ['CANCELLED', 'REJECTED'].includes(b.bookingStatus);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Customer Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming requests, accept jobs, dispatch to locations, and update service progress
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        {[
          { key: 'all', label: `All (${bookings.length})` },
          { key: 'pending', label: `New Requests (${bookings.filter((b) => b.bookingStatus === 'PENDING').length})` },
          { key: 'active', label: `Active & On Route (${bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'STARTED'].includes(b.bookingStatus)).length})` },
          { key: 'completed', label: `Completed (${bookings.filter((b) => b.bookingStatus === 'COMPLETED').length})` },
          { key: 'cancelled', label: `Declined / Cancelled (${bookings.filter((b) => ['CANCELLED', 'REJECTED'].includes(b.bookingStatus)).length})` },
        ].map((tab) => (
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
        <LoadingSpinner text="Loading jobs..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="There are currently no bookings in this category."
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const customer = booking.customerId || {};

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={customer.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`}
                      alt="Customer"
                      className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{customer.name}</h3>
                      <p className="text-xs text-brand-600 font-semibold">{booking.serviceId?.name || 'Service'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <BookingStatusBadge status={booking.bookingStatus} />
                    <BookingStatusBadge status={booking.paymentStatus} type="payment" />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>{booking.date} at {booking.time}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{customer.phone || 'Phone not provided'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{booking.address}, {booking.city}</span>
                  </div>

                  <div className="flex items-center space-x-2 lg:justify-end">
                    <span className="text-slate-400 font-semibold">Your Payout:</span>
                    <span className="text-base font-black text-slate-900">₹{booking.serviceCharge || booking.price}</span>
                  </div>
                </div>

                {/* Requirement description */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Task Details: </span>
                  {booking.description}
                  {booking.customerNotes && (
                    <span className="block mt-1 text-[11px] text-slate-500 italic">
                      Notes: {booking.customerNotes}
                    </span>
                  )}
                </div>

                {/* Action Transitions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                  <Link
                    to={`/worker/bookings/${booking._id}`}
                    className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Details & Timeline</span>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    {booking.bookingStatus === 'PENDING' && (
                      <>
                        <button
                          disabled={actionInProgress === booking._id}
                          onClick={() => {
                            setDecliningBooking(booking);
                            setDeclineModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline Request</span>
                        </button>
                        <button
                          disabled={actionInProgress === booking._id}
                          onClick={() => handleUpdateStatus(booking._id, 'ACCEPTED')}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{actionInProgress === booking._id ? 'Accepting...' : 'Accept Booking'}</span>
                        </button>
                      </>
                    )}

                    {booking.bookingStatus === 'ACCEPTED' && (
                      <button
                        disabled={actionInProgress === booking._id}
                        onClick={() => handleUpdateStatus(booking._id, 'ON_THE_WAY')}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{actionInProgress === booking._id ? 'Updating...' : 'Mark On The Way'}</span>
                      </button>
                    )}

                    {booking.bookingStatus === 'ON_THE_WAY' && (
                      <button
                        disabled={actionInProgress === booking._id}
                        onClick={() => handleUpdateStatus(booking._id, 'STARTED')}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                      >
                        <Play className="w-4 h-4" />
                        <span>{actionInProgress === booking._id ? 'Updating...' : 'Start Job (On-Site)'}</span>
                      </button>
                    )}

                    {booking.bookingStatus === 'STARTED' && (
                      <button
                        disabled={actionInProgress === booking._id}
                        onClick={() => handleUpdateStatus(booking._id, 'COMPLETED')}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>{actionInProgress === booking._id ? 'Updating...' : 'Mark Service Completed'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {declineModalOpen && decliningBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Decline Booking Request</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to decline this booking request from <strong>{decliningBooking.customerId?.name}</strong>?
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
                onClick={() => {
                  setDeclineModalOpen(false);
                  setDecliningBooking(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerBookingsPage;
