import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  MapPin,
  Briefcase,
  Star,
  Eye,
  X,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminWorkersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');

  // Selected Worker Modal state (for "Open a worker" flow)
  const [selectedWorker, setSelectedWorker] = useState(null);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getWorkers({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setWorkers(res.data || []);
    } catch (err) {
      console.error('Failed to load admin workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [statusFilter, search]);

  const handleVerify = async (workerId, newStatus) => {
    try {
      await adminService.verifyWorker(workerId, newStatus);
      addToast(`Worker status updated to ${newStatus}`, 'success');
      if (selectedWorker && selectedWorker._id === workerId) {
        setSelectedWorker((prev) => ({ ...prev, verificationStatus: newStatus }));
      }
      fetchWorkers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Worker Verification & Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve, inspect, and manage service professional accounts
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {[
            { key: '', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'verified', label: 'Verified' },
            { key: 'rejected', label: 'Rejected' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setStatusFilter(item.key);
                setSearchParams(item.key ? { status: item.key } : {});
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === item.key
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by worker name, profession, email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Workers Table */}
      {loading ? (
        <LoadingSpinner text="Loading worker records..." />
      ) : workers.length === 0 ? (
        <div className="bg-slate-950 rounded-2xl p-12 text-center text-slate-500 text-xs border border-slate-800">
          No worker accounts found matching criteria.
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Professional</th>
                  <th className="py-3.5 px-4">Profession & Area</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {workers.map((w) => {
                  const u = w.userId || {};
                  return (
                    <tr key={w._id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800"
                          />
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                            <p className="text-[10px] text-slate-500">{u.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-brand-400">{w.profession}</p>
                        <p className="text-[11px] text-slate-400">{w.serviceArea}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white">{w.experience} Years</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-white">{Number(w.rating).toFixed(1)}</span>
                          <span className="text-[10px] text-slate-500">({w.completedJobs} jobs)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            w.verificationStatus === 'verified'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : w.verificationStatus === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {w.verificationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedWorker(w)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] transition flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </button>

                          {w.verificationStatus !== 'verified' && (
                            <button
                              onClick={() => handleVerify(w._id, 'verified')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition"
                            >
                              Verify
                            </button>
                          )}
                          {w.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => handleVerify(w._id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 font-bold text-[11px] transition"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open Worker Details & Verification Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedWorker.userId?.profileImage || selectedWorker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedWorker.userId?.name}`}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-900 border border-slate-800"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-white">{selectedWorker.userId?.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        selectedWorker.verificationStatus === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : selectedWorker.verificationStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {selectedWorker.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-brand-400">{selectedWorker.profession}</p>
                  <p className="text-[11px] text-slate-400">{selectedWorker.userId?.email} • {selectedWorker.userId?.phone}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Experience</span>
                <span className="font-bold text-white text-sm">{selectedWorker.experience} Years</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Starting Rate</span>
                <span className="font-bold text-emerald-400 text-sm">₹{selectedWorker.pricing?.startingRate || 299}</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Service Area</span>
                <span className="text-slate-300">{selectedWorker.serviceArea}</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Skills & Specialties</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedWorker.skills?.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-brand-300 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">About Bio</span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {selectedWorker.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Verification Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Update status:
              </span>

              <div className="flex space-x-2">
                {selectedWorker.verificationStatus !== 'verified' && (
                  <button
                    onClick={() => handleVerify(selectedWorker._id, 'verified')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Worker (Approve)</span>
                  </button>
                )}

                {selectedWorker.verificationStatus !== 'rejected' && (
                  <button
                    onClick={() => handleVerify(selectedWorker._id, 'rejected')}
                    className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 font-bold text-xs transition flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Application</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkersPage;
