import React, { useState } from 'react';
import { Briefcase, IndianRupee, MapPin, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { workerService } from '../../services/workerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const WorkerProfileEditPage = () => {
  const { user, workerProfile, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [profession, setProfession] = useState(workerProfile?.profession || '');
  const [skills, setSkills] = useState(workerProfile?.skills?.join(', ') || '');
  const [experience, setExperience] = useState(workerProfile?.experience || 5);
  const [serviceArea, setServiceArea] = useState(workerProfile?.serviceArea || '');
  const [description, setDescription] = useState(workerProfile?.description || '');

  // Pricing
  const [startingRate, setStartingRate] = useState(workerProfile?.pricing?.startingRate || 299);
  const [hourlyRate, setHourlyRate] = useState(workerProfile?.pricing?.hourlyRate || 399);
  const [visitingCharge, setVisitingCharge] = useState(workerProfile?.pricing?.visitingCharge || 99);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await workerService.updateWorkerProfile({
        profession,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: Number(experience),
        serviceArea,
        description,
        pricing: {
          startingRate: Number(startingRate),
          hourlyRate: Number(hourlyRate),
          visitingCharge: Number(visitingCharge),
        },
      });
      addToast('Worker profile updated successfully', 'success');
      refreshUser();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Worker Profile & Service Rates
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Keep your specialties, rates, and coverage areas up to date
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Verification status header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img
              src={workerProfile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                workerProfile?.verificationStatus === 'verified'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {workerProfile?.verificationStatus} Status
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Profession Headline</label>
              <input
                type="text"
                required
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Senior Master Plumber"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Skills (comma separated tags)
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Pipe fitting, Sanitary installation, Geyser repair"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Service Areas / Localities Covered
            </label>
            <input
              type="text"
              required
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="Indiranagar, Koramangala, Domlur, HSR Layout"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Pricing settings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center">
              <IndianRupee className="w-4 h-4 mr-1 text-emerald-600" /> Transparent Pricing Rates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Starting Rate (₹)</span>
                <input
                  type="number"
                  min="99"
                  value={startingRate}
                  onChange={(e) => setStartingRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Hourly Rate (₹)</span>
                <input
                  type="number"
                  min="99"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Visiting Charge (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={visitingCharge}
                  onChange={(e) => setVisitingCharge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">About Your Service</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about your experience, certifications, and quality guarantees..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
            >
              {loading ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerProfileEditPage;
