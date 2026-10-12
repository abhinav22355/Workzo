import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CalendarCheck,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Award,
} from 'lucide-react';

const BecomeWorkerPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-3xl p-8 sm:p-16 text-white grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-2xl">
        <div className="space-y-6">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider inline-block">
            Partner With Workzo
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Grow Your Income as an Independent Specialist
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Join India's premier home services platform. Get direct booking requests from verified customers in your area, set your own service rates, and manage your schedule effortlessly.
          </p>

          <div className="pt-2">
            <Link
              to="/register?role=worker"
              className="inline-flex items-center px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 transition hover:scale-105"
            >
              <span>Register as a Professional</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Why Skilled Workers Choose Workzo</h3>
          <div className="space-y-3 text-xs text-slate-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Instant Customer Inquiries:</strong> Receive customer requests directly on your dashboard without marketing spend.</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Keep Your Earnings:</strong> Transparent flat platform fee. Direct payments received after each job.</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Set Your Own Working Hours:</strong> Configure your available days, operating hours, and blacked-out vacation dates.</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Build Reputation:</strong> Genuine customer reviews help you rank higher and charge premium rates.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Step onboarding */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          How to Become a Verified Partner
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Fast and transparent 3-step onboarding process to get you started earning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900">Register & Profile</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create your account with profession, skills, experience, and pricing details.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900">Admin Review</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our safety team reviews your application and assigns the Verified Professional badge.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900">Accept Jobs & Earn</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive customer booking alerts, navigate to client addresses, and get paid!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeWorkerPage;
