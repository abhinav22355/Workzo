import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  User,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const WorkerLayout = () => {
  const { workerProfile } = useAuth();
  const isPending = workerProfile?.verificationStatus === 'pending';
  const isRejected = workerProfile?.verificationStatus === 'rejected';

  const navItems = [
    { label: 'Overview', path: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Incoming & Active Jobs', path: '/worker/bookings', icon: Briefcase },
    { label: 'My Availability', path: '/worker/availability', icon: Clock },
    { label: 'Earnings & Payouts', path: '/worker/earnings', icon: DollarSign },
    { label: 'Worker Profile', path: '/worker/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      {/* Verification Status Warning if not verified */}
      {isPending && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2 max-w-5xl mx-auto w-full">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Verification Pending:</strong> Your worker profile is under review by Workzo administrators. You will be able to receive public customer bookings once verified.
            </span>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-rose-900 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2 max-w-5xl mx-auto w-full">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>
              <strong>Verification Not Approved:</strong> Please update your profile with valid experience and service area details to re-apply.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24">
              <div className="pb-4 mb-4 border-b border-slate-100 flex items-center space-x-3">
                <img
                  src={workerProfile?.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80'}
                  alt="Profile"
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 border"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {workerProfile?.profession || 'Service Professional'}
                  </h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {workerProfile?.verificationStatus === 'verified' ? (
                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Pro
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 capitalize">
                        {workerProfile?.verificationStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  to="/"
                  className="flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Marketplace
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Worker Content */}
          <section className="lg:col-span-3">
            <Outlet />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WorkerLayout;
