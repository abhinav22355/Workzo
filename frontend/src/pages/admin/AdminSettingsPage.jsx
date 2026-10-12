import React, { useState } from 'react';
import { Settings, Shield, Sliders, CheckCircle2, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminSettingsPage = () => {
  const { addToast } = useToast();
  const [platformFee, setPlatformFee] = useState('50');
  const [supportEmail, setSupportEmail] = useState('support@workzo.com');
  const [supportPhone, setSupportPhone] = useState('+91 80 4000 9000');
  const [cities, setCities] = useState('Bangalore, Mumbai, Delhi-NCR, Hyderabad');
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('System settings saved successfully', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Platform Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          General settings, platform booking fees, and payment gateway configuration
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Platform Booking Guarantee Fee (₹)
              </label>
              <input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Support Helpdesk Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Platform Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Active Metro Cities (comma separated)
            </label>
            <input
              type="text"
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Payment Gateway Architecture */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white">Payment Gateway Mode</h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="razorpayToggle"
                checked={razorpayEnabled}
                onChange={(e) => setRazorpayEnabled(e.target.checked)}
                className="rounded text-brand-600 focus:ring-0"
              />
              <label htmlFor="razorpayToggle" className="text-xs text-slate-300 cursor-pointer">
                Enable live Razorpay API webhook processing (Default: Pay After Service / Simulation)
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              When live credentials are not set in environment, Workzo defaults to verified on-site Pay After Service with automated receipts.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
