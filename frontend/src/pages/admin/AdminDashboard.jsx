import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading admin analytics..." />;
  }

  const stats = data?.stats || {};
  const monthlyData = data?.monthlyData || [];
  const popularServices = data?.popularServices || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Platform Overview & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time health, verification queue, and transaction volume
          </p>
        </div>

        {stats.pendingWorkers > 0 && (
          <Link
            to="/admin/workers?status=pending"
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-2 animate-pulse self-start sm:self-auto"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{stats.pendingWorkers} Workers Pending Verification</span>
          </Link>
        )}
      </div>

      {/* KPI Cards (All 8 Platform Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
          <p className="text-2xl font-black text-white">{stats.totalUsers || 0}</p>
          <span className="text-[10px] text-slate-400">{stats.totalCustomers || 0} customers</span>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Workers</span>
          <p className="text-2xl font-black text-white">{stats.totalWorkers || 0}</p>
          <span className="text-[10px] text-slate-400">Registered Pros</span>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Worker Verification</span>
          <p className="text-2xl font-black text-amber-400">{stats.pendingWorkers || 0}</p>
          <span className="text-[10px] text-amber-400/80">Awaiting approval</span>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Workers</span>
          <p className="text-2xl font-black text-emerald-400">{stats.verifiedWorkers || 0}</p>
          <span className="text-[10px] text-emerald-400/80">Active in search</span>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
          <p className="text-2xl font-black text-white">{stats.totalBookings || 0}</p>
          <span className="text-[10px] text-blue-400 font-semibold">{stats.activeBookings || 0} active</span>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Bookings</span>
          <p className="text-2xl font-black text-emerald-400">{stats.completedBookings || 0}</p>
          <span className="text-[10px] text-slate-400">Delivered services</span>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cancelled Bookings</span>
          <p className="text-2xl font-black text-rose-400">{stats.cancelledBookings || 0}</p>
          <span className="text-[10px] text-slate-400">Cancelled / declined</span>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue</span>
          <p className="text-2xl font-black text-emerald-400">₹{stats.totalRevenue || 0}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Total GMV</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookings & Revenue Trend */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-brand-400" /> Bookings & Revenue Trajectory
            </h3>
            <span className="text-xs text-slate-400">Past 6 Months</span>
          </div>

          <div className="pt-4 grid grid-cols-6 gap-3 items-end h-44 border-b border-slate-800 pb-2">
            {monthlyData.map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-end h-full">
                <span className="text-[10px] font-bold text-emerald-400 mb-1">
                  ₹{item.revenue > 1000 ? `${(item.revenue / 1000).toFixed(1)}k` : item.revenue}
                </span>
                <div
                  style={{ height: `${Math.min(100, Math.max(15, (item.revenue / (stats.totalRevenue || 30000)) * 100))}%` }}
                  className="w-full max-w-[40px] bg-gradient-to-t from-brand-600 to-emerald-400 rounded-t-lg transition hover:brightness-125 cursor-pointer"
                  title={`${item.bookings} bookings • ₹${item.revenue}`}
                />
                <span className="text-[11px] text-slate-400 mt-2 font-medium">{item.month}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            Cumulative Platform Gross Merchandise Value: <strong className="text-white">₹{stats.totalRevenue || 0}</strong>
          </p>
        </div>

        {/* Popular Services Bar breakdown */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Demand by Service Category</h3>
            <Link to="/admin/services" className="text-xs text-brand-400 hover:underline">
              Manage Services
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {popularServices.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Service metrics will appear as jobs are completed.</p>
            ) : (
              popularServices.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cat.name}</span>
                    <span className="font-bold text-white">{cat.count} bookings (₹{cat.totalAmount})</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / (stats.totalBookings || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Live Ledger */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent System Bookings</h3>
          <Link to="/admin/bookings" className="text-xs text-brand-400 hover:underline font-semibold">
            View All ({stats.totalBookings})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    #{b._id.slice(-6)}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{b.customerId?.name}</td>
                  <td className="py-3 px-4 text-slate-300">{b.workerId?.name}</td>
                  <td className="py-3 px-4">{b.serviceId?.name || 'Service'}</td>
                  <td className="py-3 px-4">
                    <BookingStatusBadge status={b.bookingStatus} />
                  </td>
                  <td className="py-3 px-4 text-right font-black text-white">₹{b.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
