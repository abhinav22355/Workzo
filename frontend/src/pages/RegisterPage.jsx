import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { serviceService } from '../services/serviceService';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, user, logout, becomeWorker } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState(searchParams.get('role') === 'worker' ? 'worker' : 'customer');
  const [categories, setCategories] = useState([]);

  // Common Fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState(user?.city || 'Bangalore');
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '560001');

  // Worker-Specific Fields
  const [profession, setProfession] = useState('Professional Plumber');
  const [skills, setSkills] = useState('Pipe Fitting, Leakage Repair, Installation');
  const [experience, setExperience] = useState('5');
  const [serviceArea, setServiceArea] = useState('Indiranagar, Koramangala');
  const [startingRate, setStartingRate] = useState('299');
  const [hourlyRate, setHourlyRate] = useState('399');
  const [serviceCategoryId, setServiceCategoryId] = useState('');
  const [description, setDescription] = useState('Certified technician providing reliable, high-quality home services.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill if already logged in customer
  useEffect(() => {
    if (user && role === 'worker') {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.address) setAddress(user.address);
      if (user.pincode) setPincode(user.pincode);
    }
  }, [user, role]);

  useEffect(() => {
    serviceService.getServices().then((res) => {
      const cats = res.data || [];
      setCategories(cats);
      if (cats.length > 0) {
        setServiceCategoryId(cats[0]._id);
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If already logged in as customer and applying to become a worker:
    if (user && user.role === 'customer' && role === 'worker') {
      setLoading(true);
      try {
        await becomeWorker({
          profession,
          skills,
          experience: Number(experience),
          serviceArea,
          startingRate: Number(startingRate),
          hourlyRate: Number(hourlyRate),
          serviceCategoryId: serviceCategoryId || undefined,
          description,
        });
        addToast('Worker application submitted! Pending admin verification.', 'success');
        navigate('/worker/dashboard');
      } catch (err) {
        const msg = err.response?.data?.message || 'Application failed. Please check inputs and try again.';
        setError(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        city,
        address,
        pincode,
        ...(role === 'worker' && {
          profession,
          skills,
          experience: Number(experience),
          serviceArea,
          startingRate: Number(startingRate),
          hourlyRate: Number(hourlyRate),
          serviceCategoryId: serviceCategoryId || undefined,
          description,
        }),
      };

      const res = await register(payload);

      if (role === 'worker') {
        addToast('Worker account registered! Application is pending admin verification.', 'success');
        navigate('/worker/dashboard');
      } else {
        addToast(`Welcome to Workzo, ${res.user.name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs and try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              WORK<span className="text-brand-600">ZO</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose whether you are booking services or offering professional skills
          </p>

          {/* Role selector tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                role === 'customer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>I need a Service (Customer)</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                role === 'worker'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>I am a Specialist (Worker)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {user && user.role === 'customer' && role === 'worker' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold">Applying with your active account: {user.name} ({user.email})</p>
                <p className="text-[11px] text-emerald-600">Your account will be upgraded to a Service Professional upon approval.</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold flex-shrink-0 ml-3"
              >
                Log Out
              </button>
            </div>
          )}

          {/* General Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              disabled={!!(user && user.role === 'customer' && role === 'worker')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rajesh@example.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          {/* Hide password if already logged in customer applying for worker */}
          {!(user && user.role === 'customer' && role === 'worker') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Worker Extra Section */}
          {role === 'worker' && (
            <div className="pt-4 border-t border-slate-100 space-y-3 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Professional Worker Credentials</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Profession Title</label>
                  <input
                    type="text"
                    required
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Master Electrician"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Service Category</label>
                  <select
                    value={serviceCategoryId}
                    onChange={(e) => setServiceCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    min="99"
                    required
                    value={startingRate}
                    onChange={(e) => setStartingRate(e.target.value)}
                    placeholder="299"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Short Circuit Repair, Inverter Wiring, Fan Setup"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Service Area / Localities</label>
                <input
                  type="text"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Indiranagar, Koramangala, HSR"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">About Your Work</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share a short summary about your qualifications and quality guarantees..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 ${
              role === 'worker'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
            }`}
          >
            <span>
              {loading
                ? 'Submitting...'
                : user && user.role === 'customer' && role === 'worker'
                ? 'Submit Worker Application'
                : role === 'worker'
                ? 'Submit Worker Registration'
                : 'Register Customer Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
