import React, { useState, useEffect } from 'react';
import { IndianRupee, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllPayments().then((res) => {
      setPayments(res.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const totalVolume = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Transaction & Payment Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit payment receipts, method distribution, and settlement logs
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Volume</span>
          <span className="text-lg font-black text-emerald-400">₹{totalVolume}</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading payment ledger..." />
      ) : payments.length === 0 ? (
        <div className="bg-slate-950 rounded-2xl p-12 text-center text-slate-500 text-xs border border-slate-800">
          No payment transactions logged yet.
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Worker Beneficiary</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-brand-400">
                      {p.transactionId || `#TXN_${p._id.slice(-6)}`}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">{p.customerId?.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.workerId?.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                        {p.paymentMethod === 'RAZORPAY_ONLINE' ? 'Razorpay' : 'Cash After Service'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-white">
                      ₹{p.amount}
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

export default AdminPaymentsPage;
