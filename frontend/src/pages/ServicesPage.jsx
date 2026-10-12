import React, { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices();
        setServices(res.data || []);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> All Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Browse Service Categories
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Choose a specialty below to view available verified professionals in your neighborhood.
        </p>

        {/* Filter search bar */}
        <div className="mt-6 relative max-w-md mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plumbing, cleaning, AC repair..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading service categories..." />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          title="No services found"
          description="We couldn't find any service matching your search query. Try another keyword."
          actionText="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
