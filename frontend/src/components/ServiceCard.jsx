import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getServiceIcon } from '../utils/iconHelper';

const ServiceCard = ({ service }) => {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
          {getServiceIcon(service.icon, 'w-7 h-7')}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-brand-600 transition-colors">
          {service.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {service.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Starts From</span>
          <span className="text-lg font-extrabold text-slate-900">₹{service.startingPrice}</span>
        </div>
        <Link
          to={`/workers?serviceId=${service._id}`}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-50 hover:bg-brand-600 text-slate-700 hover:text-white font-semibold text-xs transition-all duration-200"
        >
          View Service <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
