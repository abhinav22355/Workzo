import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Star,
  DollarSign,
  Briefcase,
  X,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { workerService } from '../services/workerService';
import { serviceService } from '../services/serviceService';
import WorkerCard from '../components/WorkerCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BookingModal from '../components/BookingModal';

const WorkersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minExperience, setMinExperience] = useState(searchParams.get('minExperience') || '');
  const [availabilityDay, setAvailabilityDay] = useState(searchParams.get('availabilityDay') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recommended');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await serviceService.getServices();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch workers when filter dependencies change
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const queryParams = {
          search: search || undefined,
          serviceId: serviceId || undefined,
          location: location || undefined,
          minRating: minRating || undefined,
          maxPrice: maxPrice || undefined,
          minExperience: minExperience || undefined,
          availabilityDay: availabilityDay || undefined,
          sort,
        };

        const res = await workerService.getWorkers(queryParams);
        setWorkers(res.data || []);
      } catch (err) {
        console.error('Failed to load workers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [search, serviceId, location, minRating, maxPrice, minExperience, availabilityDay, sort]);

  // Sync to URL parameters
  const updateUrlParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setServiceId('');
    setLocation('');
    setMinRating('');
    setMaxPrice('');
    setMinExperience('');
    setAvailabilityDay('');
    setSort('recommended');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Find Skilled Professionals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare verified ratings, experience, and pricing. Book directly online.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 flex items-center"
          >
            <Filter className="w-4 h-4 mr-1.5" /> Filters
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateUrlParams('sort', e.target.value);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="recommended">Recommended</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="lowest_price">Lowest Price</option>
              <option value="most_experienced">Most Experienced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel (Sidebar) */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? 'block fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4' : 'hidden'
          }`}
        >
          <div
            className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm ${
              mobileFilterOpen ? 'max-w-md mx-auto max-h-[90vh] overflow-y-auto mt-12' : 'sticky top-24'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Filter Workers</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-brand-600 hover:underline font-semibold"
                >
                  Reset
                </button>
                {mobileFilterOpen && (
                  <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 p-1">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Keyword Search */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 block mb-2">Keyword</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    updateUrlParams('search', e.target.value);
                  }}
                  placeholder="e.g. Plumber, Leak, Wiring"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Service Category */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 block mb-2">Category</label>
              <select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  updateUrlParams('serviceId', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location / Area */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 block mb-2">Location / Area</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    updateUrlParams('location', e.target.value);
                  }}
                  placeholder="e.g. Indiranagar, HSR Layout"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 block mb-2">Minimum Rating</label>
              <div className="flex flex-wrap gap-2">
                {['', '4.5', '4.0', '3.5'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setMinRating(r);
                      updateUrlParams('minRating', r);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition ${
                      minRating === r
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-current mr-1" /> {r}+
                      </>
                    ) : (
                      'Any'
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 block mb-2">Experience</label>
              <div className="flex flex-wrap gap-2">
                {['', '3', '5', '8'].map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => {
                      setMinExperience(exp);
                      updateUrlParams('minExperience', exp);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      minExperience === exp
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {exp ? `${exp}+ Yrs` : 'Any'}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Starting Price */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Max Starting Price {maxPrice ? `(₹${maxPrice})` : ''}
              </label>
              <input
                type="range"
                min="199"
                max="1500"
                step="50"
                value={maxPrice || 1500}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateUrlParams('maxPrice', e.target.value);
                }}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹199</span>
                <span>₹1,500</span>
              </div>
            </div>

            {/* Available Day */}
            <div className="mb-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">Available Day</label>
              <select
                value={availabilityDay}
                onChange={(e) => {
                  setAvailabilityDay(e.target.value);
                  updateUrlParams('availabilityDay', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Any Day</option>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        {/* Worker Cards Grid */}
        <main className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{workers.length}</strong> verified professionals
            </span>
          </div>

          {loading ? (
            <LoadingSpinner text="Searching verified professionals..." />
          ) : workers.length === 0 ? (
            <EmptyState
              title="No professionals matched your criteria"
              description="Try adjusting your filters or expanding your search location to view more professionals."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workers.map((worker) => (
                <WorkerCard
                  key={worker._id}
                  worker={worker}
                  selectedServiceId={serviceId}
                  onBookNow={(w) => setSelectedWorkerForBooking(w)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {selectedWorkerForBooking && (
        <BookingModal
          worker={selectedWorkerForBooking}
          initialServiceId={serviceId}
          categories={categories}
          onClose={() => setSelectedWorkerForBooking(null)}
          onSuccess={(booking) => {
            setSelectedWorkerForBooking(null);
            navigate(`/bookings/${booking._id}`);
          }}
        />
      )}
    </div>
  );
};

export default WorkersPage;
