import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  XCircle,
  IndianRupee,
  Clock,
  ArrowRight,
  MapPin,
  Sparkles,
  AlertCircle,
  Star,
  Truck,
  Play,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { serviceService } from '../services/serviceService';
import { useAuth } from '../context/AuthContext';
import BookingStatusBadge from '../components/BookingStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ServiceCard from '../components/ServiceCard';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        bookingService.getBookings(),
        serviceService.getServices(),
      ]);
      setBookings(bookingsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 8000); // 8s auto-poll
    return () => clearInterval(interval);
  }, []);

  // Compute KPI statistics
  const upcomingCount = bookings.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.bookingStatus)).length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => ['CANCELLED', 'REJECTED'].includes(b.bookingStatus)).length;
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  // Find active booking (priority: ON_THE_WAY, STARTED, ACCEPTED, PENDING)
  const activeBooking =
    bookings.find((b) => ['ON_THE_WAY', 'STARTED'].includes(b.bookingStatus)) ||
    bookings.find((b) => b.bookingStatus === 'ACCEPTED') ||
    bookings.find((b) => b.bookingStatus === 'PENDING');

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  // Define dynamic status presentation for active booking
  const getActiveBookingHeader = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          badge: 'Confirmed / Specialist Assigned',
          title: `Booking Accepted with ${activeBooking.workerId?.name}`,
          desc: `${activeBooking.workerId?.name} has accepted your appointment for ${activeBooking.date} at ${activeBooking.time}.`,
          bgClass: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-blue-200',
          dotColor: 'bg-emerald-500',
        };
      case 'ON_THE_WAY':
        return {
          badge: 'Specialist Dispatched',
          title: `${activeBooking.workerId?.name} is On The Way`,
          desc: 'Your specialist has left and is traveling to your location.',
          bgClass: 'bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-200',
          dotColor: 'bg-indigo-600',
        };
      case 'STARTED':
        return {
          badge: 'Work In Progress',
          title: `Service Underway with ${activeBooking.workerId?.name}`,
          desc: 'Your professional is currently on-site performing the service.',
          bgClass: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200',
          dotColor: 'bg-purple-600',
        };
      case 'PENDING':
      default:
        return {
          badge: 'Awaiting Specialist Response',
          title: `Booking Requested: ${activeBooking.serviceId?.name || 'Service'}`,
          desc: `Sent to ${activeBooking.workerId?.name}. Waiting for worker to accept your request.`,
          bgClass: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
          dotColor: 'bg-amber-500',
        };
    }
  };

  const activeHeader = activeBooking ? getActiveBookingHeader(activeBooking.bookingStatus) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center text-xs font-bold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Customer Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your service appointments, track ongoing jobs, and view receipts.
          </p>
        </div>

        <Link
          to="/workers"
          className="mt-4 md:mt-0 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-lg transition flex items-center space-x-1.5"
        >
          <span>Book a New Service</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Jobs</span>
            <span className="text-2xl font-black text-slate-900">{upcomingCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Jobs</span>
            <span className="text-2xl font-black text-slate-900">{completedCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cancelled Jobs</span>
            <span className="text-2xl font-black text-slate-900">{cancelledCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Spent</span>
            <span className="text-2xl font-black text-slate-900">₹{totalSpent}</span>
          </div>
        </div>
      </div>

      {/* Active Booking Card (Live Tracking Banner) */}
      {activeBooking && activeHeader && (
        <div className={`border rounded-3xl p-6 shadow-sm ${activeHeader.bgClass}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${activeHeader.dotColor} animate-ping`} />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  {activeHeader.badge}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {activeHeader.title}
                </h3>
              </div>
            </div>
            <BookingStatusBadge status={activeBooking.bookingStatus} />
          </div>

          <div className="pt-3 pb-1">
            <p className="text-xs text-slate-600 font-medium">
              {activeHeader.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs text-slate-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>{activeBooking.date} at {activeBooking.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{activeBooking.address}, {activeBooking.city}</span>
            </div>
            <div className="flex sm:justify-end">
              <Link
                to={`/bookings/${activeBooking._id}`}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition"
              >
                Track Live Status <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
          <Link to="/bookings" className="text-xs font-bold text-brand-600 hover:underline">
            View All ({bookings.length})
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
            You haven't placed any bookings yet. Browse our verified specialists!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {bookings.slice(0, 4).map((b) => (
              <div key={b._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={b.workerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.workerId?.name}`}
                    alt="Worker"
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 border flex-shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.workerId?.name}</h4>
                    <p className="text-xs text-brand-600 font-semibold">{b.serviceId?.name || 'Service'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {b.date} • {b.time} • ₹{b.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <BookingStatusBadge status={b.bookingStatus} />
                  <Link
                    to={`/bookings/${b._id}`}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Services Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
