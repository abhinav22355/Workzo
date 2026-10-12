import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Users,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { workerService } from '../services/workerService';
import ServiceCard from '../components/ServiceCard';
import WorkerCard from '../components/WorkerCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Bangalore');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [servicesRes, workersRes] = await Promise.all([
          serviceService.getServices(),
          workerService.getWorkers({ sort: 'highest_rated' }),
        ]);
        setServices(servicesRes.data || []);
        setTopWorkers((workersRes.data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/workers?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-hero border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-100/70 text-brand-700 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-brand-600" />
              India's Most Trusted On-Demand Service Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Find the Right Professional for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600">Every Job</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Book certified plumbers, electricians, cleaners, carpenters, and appliance experts for your everyday home and service needs.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-3 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 transition-all focus-within:ring-2 focus-within:ring-brand-500/20"
            >
              <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 sm:bg-transparent rounded-xl">
                <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plumber, electrician, cleaner..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              <div className="sm:w-48 flex items-center px-3 py-2 bg-slate-50 sm:bg-transparent sm:border-l sm:border-slate-200 rounded-xl">
                <MapPin className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Enter location"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl sm:rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/30 transition-all hover:scale-102 flex items-center justify-center space-x-1"
              >
                <span>Find Workers</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>

            {/* Quick search pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular:</span>
              {['Plumbing', 'Electrical', 'Deep Cleaning', 'AC Servicing', 'Carpentry'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    navigate(`/workers?search=${encodeURIComponent(term)}`);
                  }}
                  className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              Top Categories
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Our Professional Services
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Handpicked, verified specialists ready to serve at your doorstep.
            </p>
          </div>
          <Link
            to="/services"
            className="mt-4 sm:mt-0 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center"
          >
            Explore all 10+ services <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading service categories..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 8).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works (Section 10 from Prompt) */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-2">
            Simple 4-Step Booking
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Workzo Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Get your home problem solved in four simple and seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-black text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Choose a Service</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select from plumbing, electrical, carpentry, cleaning, painting, or any of our 10 specialized categories.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Describe Requirement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your specific issue details, preferred service date, time slot, and home address.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Choose a Professional</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare worker ratings, verified experience, transparent upfront pricing, and customer reviews.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative flex flex-col justify-between hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-lg mb-4">
              04
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Book & Done</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track arrival status, enjoy guaranteed service quality, pay easily after service, and share your review.
            </p>
          </div>
        </div>
      </section>

      {/* Top Rated Workers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              Top Rated Pros
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Verified & High-Scoring Specialists
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Rated 4.8+ stars by verified customers across hundreds of completed jobs.
            </p>
          </div>
          <Link
            to="/workers"
            className="mt-4 sm:mt-0 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center"
          >
            View all workers <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Finding top rated specialists..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topWorkers.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                onBookNow={() => navigate(`/workers/${worker._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Workzo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xl">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Workzo Guarantee
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4 mb-4">
              Peace of mind for your home repairs
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Every professional on Workzo undergoes strict background checks, skill evaluation, and identity verification before accepting bookings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Advance Fees Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pay After Service Option</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Job Progression</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Customer Reviews</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 text-center">
            <h4 className="text-xl font-bold text-white mb-2">Are you a skilled professional?</h4>
            <p className="text-xs text-slate-300 mb-6">
              Join thousands of plumbers, electricians, and technicians expanding their income on Workzo.
            </p>
            <Link
              to="/become-worker"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
            >
              Apply as a Service Partner <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
