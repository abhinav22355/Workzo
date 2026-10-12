import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Clock, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 border-b border-slate-800 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Verified Experts</h4>
              <p className="text-xs text-slate-400">Background checked professionals</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Transparent Pricing</h4>
              <p className="text-xs text-slate-400">Standard upfront rates with no hidden fees</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">On-Time Guarantee</h4>
              <p className="text-xs text-slate-400">Punctual arrival with live status updates</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Brand info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                WORK<span className="text-brand-500">ZO</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              "Your Need. Our Professionals." On-demand service platform connecting households with vetted plumbers, electricians, carpenters, cleaners, and technicians.
            </p>
          </div>

          {/* Popular Services */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Top Services
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/workers?search=Plumbing" className="hover:text-white transition">Plumbing Services</Link></li>
              <li><Link to="/workers?search=Electrical" className="hover:text-white transition">Electrical Repairs</Link></li>
              <li><Link to="/workers?search=Cleaning" className="hover:text-white transition">Deep Home Cleaning</Link></li>
              <li><Link to="/workers?search=AC" className="hover:text-white transition">AC Servicing & Gas Refill</Link></li>
              <li><Link to="/workers?search=Carpentry" className="hover:text-white transition">Woodcraft & Carpentry</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/services" className="hover:text-white transition">All Categories</Link></li>
              <li><Link to="/workers" className="hover:text-white transition">Find Professionals</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition">How Workzo Works</Link></li>
              <li><Link to="/become-worker" className="hover:text-white transition">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Demo Access */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Demo Access
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/login" className="hover:text-white transition">Customer Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Worker Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Admin Management</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Workzo Marketplace Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
