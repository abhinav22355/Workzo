import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CalendarCheck,
  CheckCircle,
  XCircle,
  IndianRupee,
  Star,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Truck,
  Play,
  CheckCheck,
  Eye,
  Calendar,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const WorkerDashboard = () => {
  const { user, workerProfile } = useAuth();
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Decline Modal state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [decliningBooking, setDecliningBooking] = useState(null);
  const [declineReason, setDeclineReason] = useState('Schedule conflict / unavailable');

  const fetchWorkerBookings = async () => {
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
    fetchWorkerBookings();
    const interval = setInterval(fetchWorkerBookings, 8000); // 8s auto-poll for new bookings
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id, newStatus, extra = {}) => {
    setActionInProgress(id);
    try {
      await bookingService.updateBookingStatus(id, newStatus, extra);
      if (newStatus === 'ACCEPTED') {
        addToast('Booking accepted! The customer has been notified.', 'success');
      } else if (newStatus === 'REJECTED') {
        addToast('Booking request declined.', 'info');
      } else if (newStatus === 'ON_THE_WAY') {
        addToast('Status updated: You are on the way to the customer.', 'success');
      } else if (newStatus === 'STARTED') {
        addToast('Service started on-site.', 'success');
      } else if (newStatus === 'COMPLETED') {
        addToast('Service marked as completed!', 'success');
      } else {
        addToast(`Job status updated to ${newStatus}`, 'success');
      }
      fetchWorkerBookings();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update job status', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmDecline = async () => {
    if (!decliningBooking) return;
    await handleStatusUpdate(decliningBooking._id, 'REJECTED', { note: declineReason });
    setDeclineModalOpen(false);
    setDecliningBooking(null);
  };

  if (loading) {
    return <LoadingSpinner text="Loading worker dashboard..." />;
  }

  // Calculate Worker KPI stats
  const pendingRequests = bookings.filter((b) => b.bookingStatus === 'PENDING');
  const upcomingJobs = bookings.filter((b) => b.bookingStatus === 'ACCEPTED');
  const inProgressJobs = bookings.filter((b) => ['ON_THE_WAY', 'STARTED'].includes(b.bookingStatus));
  const completedJobs = bookings.filter((b) => b.bookingStatus === 'COMPLETED');
  const totalEarnings = completedJobs.reduce((acc, curr) => acc + (curr.serviceCharge || curr.price || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Specialist Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {workerProfile?.profession} • {workerProfile?.serviceArea}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/worker/bookings"
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition"
          >
            View All Jobs ({bookings.length})
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Requests</span>
          <span className="text-2xl font-black text-amber-600">{pendingRequests.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Jobs</span>
          <span className="text-2xl font-black text-blue-600">{upcomingJobs.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Jobs</span>
          <span className="text-2xl font-black text-emerald-600">{completedJobs.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Earnings</span>
          <span className="text-2xl font-black text-slate-900">₹{totalEarnings}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Rating</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-black text-slate-900">
              {Number(workerProfile?.rating || 5.0).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">({workerProfile?.totalReviews || 0})</span>
          </div>
        </div>
      </div>

      {/* Immediate Attention: Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-base font-bold text-amber-950">
                New Booking Requests ({pendingRequests.length})
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900">
              Action Required
            </span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{req.customerId?.name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                      {req.serviceId?.name || 'Service'}
                    </span>
                    <BookingStatusBadge status={req.bookingStatus} />
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    <span className="font-bold text-slate-900">Requirement: </span>
                    "{req.description}"
                  </p>

                  {req.customerNotes && (
                    <p className="text-[11px] text-slate-500 italic">
                      Notes: {req.customerNotes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span>{req.date} at {req.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{req.address}, {req.city}</span>
                    </span>
                    {req.customerId?.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.customerId.phone}</span>
                      </span>
                    )}
                    <span className="text-slate-900 font-bold">
                      Payout: ₹{req.serviceCharge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                  <Link
                    to={`/worker/bookings/${req._id}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    disabled={actionInProgress === req._id}
                    onClick={() => {
                      setDecliningBooking(req);
                      setDeclineModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    disabled={actionInProgress === req._id}
                    onClick={() => handleStatusUpdate(req._id, 'ACCEPTED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{actionInProgress === req._id ? 'Accepting...' : 'Accept Booking'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming & Confirmed Appointments (Accepted Jobs) */}
      {upcomingJobs.length > 0 && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <h3 className="text-base font-bold text-blue-950">
                Upcoming & Confirmed Appointments ({upcomingJobs.length})
              </h3>
            </div>
            <span className="text-xs text-blue-700 font-medium">Ready for dispatch</span>
          </div>

          <div className="space-y-3">
            {upcomingJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{job.customerId?.name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {job.serviceId?.name || 'Service'}
                    </span>
                    <BookingStatusBadge status={job.bookingStatus} />
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    "{job.description}"
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span>{job.date} at {job.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{job.address}, {job.city}</span>
                    </span>
                    {job.customerId?.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.customerId.phone}</span>
                      </span>
                    )}
                    <span className="text-slate-900 font-bold">
                      Payout: ₹{job.serviceCharge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                  <Link
                    to={`/worker/bookings/${job._id}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    disabled={actionInProgress === job._id}
                    onClick={() => handleStatusUpdate(job._id, 'ON_THE_WAY')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{actionInProgress === job._id ? 'Updating...' : 'Mark On The Way'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ongoing / In-Progress Service */}
      {inProgressJobs.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-indigo-900 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <span>In-Progress Jobs ({inProgressJobs.length})</span>
            </h3>
            <span className="text-xs text-indigo-700 font-medium">Active work</span>
          </div>

          <div className="space-y-3">
            {inProgressJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">{job.customerId?.name}</h4>
                    <span className="text-xs text-brand-600 font-semibold">{job.serviceId?.name}</span>
                    <BookingStatusBadge status={job.bookingStatus} />
                  </div>
                  <p className="text-xs text-slate-600">{job.description}</p>
                  <p className="text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                    {job.address}, {job.city} ({job.customerId?.phone})
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <Link
                    to={`/worker/bookings/${job._id}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  {job.bookingStatus === 'ON_THE_WAY' && (
                    <button
                      disabled={actionInProgress === job._id}
                      onClick={() => handleStatusUpdate(job._id, 'STARTED')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{actionInProgress === job._id ? 'Updating...' : 'Start Job (On-Site)'}</span>
                    </button>
                  )}
                  {job.bookingStatus === 'STARTED' && (
                    <button
                      disabled={actionInProgress === job._id}
                      onClick={() => handleStatusUpdate(job._id, 'COMPLETED')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{actionInProgress === job._id ? 'Updating...' : 'Mark Completed'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple Earnings Performance Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Weekly Earnings Overview</h3>
          </div>
          <Link to="/worker/earnings" className="text-xs font-bold text-brand-600 hover:underline">
            View Statement
          </Link>
        </div>

        {/* Weekly simulated chart bar bars */}
        <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-36 border-b border-slate-100 pb-2">
          {[
            { day: 'Mon', amount: 350, h: '35%' },
            { day: 'Tue', amount: 700, h: '70%' },
            { day: 'Wed', amount: 500, h: '50%' },
            { day: 'Thu', amount: 900, h: '90%' },
            { day: 'Fri', amount: 400, h: '40%' },
            { day: 'Sat', amount: 1100, h: '100%' },
            { day: 'Sun', amount: 300, h: '30%' },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center justify-end h-full">
              <div
                style={{ height: bar.h }}
                className="w-full max-w-[36px] bg-brand-500 rounded-t-lg hover:bg-brand-600 transition cursor-pointer"
                title={`₹${bar.amount}`}
              />
              <span className="text-[10px] text-slate-400 mt-2 font-medium">{bar.day}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 text-right">
          Total weekly estimated payout: <strong className="text-slate-700">₹4,250</strong>
        </p>
      </div>

      {/* Decline Confirmation Modal */}
      {declineModalOpen && decliningBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Decline Booking Request</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to decline this booking request from <strong>{decliningBooking.customerId?.name}</strong> for {decliningBooking.date} at {decliningBooking.time}?
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

export default WorkerDashboard;
