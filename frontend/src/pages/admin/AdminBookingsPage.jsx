import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, IndianRupee, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings({ status: statusFilter || undefined });
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            All Marketplace Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log of all customer appointments and worker assignments
          </p>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {['', 'PENDING', 'ACCEPTED', 'ON_THE_WAY', 'STARTED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st ? st.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading bookings ledger..." />
      ) : bookings.length === 0 ? (
        <div className="bg-slate-950 rounded-2xl p-12 text-center text-slate-500 text-xs border border-slate-800">
          No bookings found.
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Worker</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Booking Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      #{b._id.slice(-6)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{b.date}</p>
                      <p className="text-[10px] text-slate-400">{b.time}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">{b.customerId?.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{b.workerId?.name}</td>
                    <td className="py-3.5 px-4">{b.serviceId?.name}</td>
                    <td className="py-3.5 px-4">
                      <BookingStatusBadge status={b.bookingStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <BookingStatusBadge status={b.paymentStatus} type="payment" />
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-white">
                      ₹{b.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
