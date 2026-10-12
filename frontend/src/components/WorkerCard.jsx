import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Briefcase, CalendarCheck, Star, ArrowRight } from 'lucide-react';
import RatingStars from './RatingStars';

const WorkerCard = ({ worker, onBookNow, selectedServiceId }) => {
  const user = worker.userId || {};
  const startingRate = worker.pricing?.startingRate || 299;
  const isVerified = worker.verificationStatus === 'verified';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={user.profileImage || worker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Worker'}`}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200"
            />
            {isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-sm" title="Workzo Verified Professional">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {user.name}
              </h3>
              {isVerified && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-brand-600 truncate mb-1">
              {worker.profession}
            </p>
            <div className="flex items-center space-x-2">
              <RatingStars rating={worker.rating} totalReviews={worker.totalReviews} size="sm" />
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-500">
                {worker.completedJobs} jobs completed
              </span>
            </div>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{worker.experience} yrs experience</span>
          </div>
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{worker.serviceArea || user.city || 'Bangalore'}</span>
          </div>
        </div>

        {/* Skills pills */}
        {worker.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {worker.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{worker.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Pricing & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Starts from</span>
          <span className="text-lg font-black text-slate-900">₹{startingRate}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={selectedServiceId ? `/workers/${worker._id}?serviceId=${selectedServiceId}` : `/workers/${worker._id}`}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            Profile
          </Link>
          <button
            onClick={() => onBookNow ? onBookNow(worker) : null}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
