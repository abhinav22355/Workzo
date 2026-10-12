import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, CheckCircle2, Clock, Calendar, Download } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const WorkerEarningsPage = () => {
  const { user, workerProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getBookings().then((res) => {
      setBookings(res.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading earnings statement..." />;
  }

  const completedJobs = bookings.filter((b) => b.bookingStatus === 'COMPLETED');
  const totalEarned = completedJobs.reduce((acc, curr) => acc + (curr.serviceCharge || 0), 0);
  const pendingCollection = bookings
    .filter((b) => b.bookingStatus !== 'CANCELLED' && b.paymentStatus === 'PENDING')
    .reduce((acc, curr) => acc + (curr.serviceCharge || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Earnings & Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of your realized revenues and settlement status
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Realized Revenue</span>
          <div className="flex items-center space-x-1">
            <span className="text-3xl font-black text-slate-900">₹{totalEarned}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {completedJobs.length} successfully closed orders
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Collection</span>
          <div className="flex items-center space-x-1">
            <span className="text-3xl font-black text-amber-600">₹{pendingCollection}</span>
          </div>
          <p className="text-[11px] text-slate-400">Pay-after-service collection on completion</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Payout / Order</span>
          <div className="flex items-center space-x-1">
            <span className="text-3xl font-black text-brand-600">
              ₹{completedJobs.length > 0 ? Math.round(totalEarned / completedJobs.length) : workerProfile?.pricing?.startingRate || 299}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Based on recent completed works</p>
        </div>
      </div>

      {/* Payouts list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Completed Service Settlements</h3>
          <span className="text-xs text-slate-400">{completedJobs.length} records</span>
        </div>

        {completedJobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed jobs yet. Keep accepting incoming bookings!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedJobs.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{b.date}</td>
                    <td className="py-3.5 px-4">{b.customerId?.name}</td>
                    <td className="py-3.5 px-4">{b.serviceId?.name || 'Repairs'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {b.paymentMethod === 'RAZORPAY_ONLINE' ? 'Razorpay' : 'Cash on Site'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      ₹{b.serviceCharge || b.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerEarningsPage;
