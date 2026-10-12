import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Wrench,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { workerService } from '../services/workerService';
import { serviceService } from '../services/serviceService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BookingModal = ({
  worker,
  service,
  initialServiceId,
  categories: passedCategories = [],
  onClose,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // All service categories
  const [allCategories, setAllCategories] = useState(passedCategories);

  // Load all categories if not passed
  useEffect(() => {
    if (!passedCategories || passedCategories.length === 0) {
      serviceService
        .getServices()
        .then((res) => {
          if (res?.data) {
            setAllCategories(res.data);
          }
        })
        .catch((err) => console.error('Failed to load categories in BookingModal:', err));
    }
  }, [passedCategories]);

  // Determine available services for this worker
  const [availableServices, setAvailableServices] = useState([]);

  useEffect(() => {
    const rawCats = worker?.serviceCategories || [];
    let resolved = [];

    // If raw categories are already populated objects with name
    if (rawCats.length > 0 && typeof rawCats[0] === 'object' && rawCats[0]?.name) {
      resolved = rawCats;
    } else if (rawCats.length > 0 && allCategories.length > 0) {
      // Map ObjectId strings to category objects from allCategories
      resolved = rawCats
        .map((catItem) => {
          const catId = typeof catItem === 'object' ? catItem?._id : catItem;
          return allCategories.find((c) => c._id === catId);
        })
        .filter(Boolean);
    }

    // If still empty but allCategories available, try matching worker's profession
    if (resolved.length === 0 && allCategories.length > 0 && worker?.profession) {
      const match = allCategories.find((c) =>
        worker.profession.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(worker.profession.toLowerCase())
      );
      if (match) {
        resolved = [match];
      }
    }

    setAvailableServices(resolved);
  }, [worker, allCategories]);

  // Selected serviceId state
  const [serviceId, setServiceId] = useState(() => {
    if (initialServiceId) return initialServiceId;
    if (service?._id) return service._id;
    if (typeof service === 'string') return service;
    if (worker?.serviceCategories?.[0]?._id) return worker.serviceCategories[0]._id;
    if (typeof worker?.serviceCategories?.[0] === 'string') return worker.serviceCategories[0];
    return '';
  });

  // Ensure serviceId gets set once availableServices or initialServiceId resolves
  useEffect(() => {
    if (initialServiceId) {
      setServiceId(initialServiceId);
    } else if (service?._id) {
      setServiceId(service._id);
    } else if (typeof service === 'string') {
      setServiceId(service);
    } else if (!serviceId && availableServices.length > 0) {
      setServiceId(availableServices[0]._id);
    }
  }, [initialServiceId, service, availableServices]);

  // Form fields
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00 AM');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Bangalore');
  const [pincode, setPincode] = useState(user?.pincode || '560038');
  const [description, setDescription] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_AFTER_SERVICE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingSlots, setCheckingSlots] = useState(false);

  // Time slots
  const standardTimeSlots = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM',
    '06:30 PM',
  ];

  // Fetch worker availability for selected date
  useEffect(() => {
    const checkSlots = async () => {
      if (!worker?._id || !date) return;
      setCheckingSlots(true);
      try {
        const res = await workerService.getWorkerAvailability(worker._id, date);
        setAvailability(res);
      } catch (err) {
        console.error('Failed to get availability:', err);
      } finally {
        setCheckingSlots(false);
      }
    };
    checkSlots();
  }, [worker, date]);

  // Pricing calculations
  const serviceCharge = worker?.pricing?.startingRate || 299;
  const bookingFee = 50;
  const totalPrice = serviceCharge + bookingFee;

  // Selected Service object for display
  const selectedServiceObj =
    availableServices.find((s) => s._id === serviceId) ||
    allCategories.find((s) => s._id === serviceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      addToast('Please login to create a booking', 'info');
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      setError('Only customers can book service professionals.');
      return;
    }

    if (!serviceId) {
      setError('Please select a service before confirming your booking.');
      return;
    }

    if (!date || !time) {
      setError('Please select a service date and time slot.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of the problem or requirement.');
      return;
    }

    if (!address.trim() || !city.trim() || !pincode.trim()) {
      setError('Please provide a valid service address, city, and pincode.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        workerId: worker._id,
        serviceId,
        description: description.trim(),
        date,
        time,
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        customerNotes: customerNotes.trim(),
        paymentMethod,
      };

      const res = await bookingService.createBooking(payload);
      addToast('Booking Confirmed! Your service booking has been created successfully.', 'success');
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place booking. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const bookedSlots = availability?.bookedSlots || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <img
              src={worker?.userId?.profileImage || worker?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker?.userId?.name}`}
              alt={worker?.userId?.name}
              className="w-10 h-10 rounded-xl object-cover bg-slate-200"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Book {worker?.userId?.name}
              </h3>
              <p className="text-xs text-brand-600 font-semibold">{worker?.profession}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block flex items-center">
              <Wrench className="w-3.5 h-3.5 mr-1 text-slate-400" /> Service Category <span className="text-rose-500 ml-1">*</span>
            </label>
            {availableServices.length > 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableServices.map((cat) => (
                  <label
                    key={cat._id}
                    onClick={() => setServiceId(cat._id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition ${
                      serviceId === cat._id
                        ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="serviceCategory"
                        value={cat._id}
                        checked={serviceId === cat._id}
                        onChange={() => setServiceId(cat._id)}
                        className="text-brand-600"
                      />
                      <span className="font-bold">{cat.name}</span>
                    </div>
                    {cat.startingPrice && (
                      <span className="text-[10px] text-slate-500 font-semibold">from ₹{cat.startingPrice}</span>
                    )}
                  </label>
                ))}
              </div>
            ) : availableServices.length === 1 ? (
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center text-slate-900">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  {availableServices[0].name}
                </span>
                <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                  Confirmed Specialty
                </span>
              </div>
            ) : (
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Select Service Category --</option>
                {allCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} (from ₹{c.startingPrice})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Service Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> Time Slot
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {standardTimeSlots.map((slot) => {
                  const isSlotTaken = bookedSlots.includes(slot);
                  return (
                    <option key={slot} value={slot} disabled={isSlotTaken}>
                      {slot} {isSlotTaken ? '(Already Booked)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" /> Describe Your Requirement
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem in detail (e.g. bathroom pipe leaking under sink, switchboard sparking, etc.)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Address Information */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> Service Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat / House No., Building Name, Street..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Bangalore)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode (e.g. 560038)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1 text-slate-400" /> Payment Preference
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center p-3 rounded-xl border cursor-pointer text-xs font-medium transition ${
                  paymentMethod === 'CASH_AFTER_SERVICE'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_AFTER_SERVICE"
                  checked={paymentMethod === 'CASH_AFTER_SERVICE'}
                  onChange={() => setPaymentMethod('CASH_AFTER_SERVICE')}
                  className="mr-2 text-brand-600"
                />
                <div>
                  <span className="font-bold block">Cash / Pay Later</span>
                  <span className="text-[10px] text-slate-500">Pay worker after job completion</span>
                </div>
              </label>

              <label
                className={`flex items-center p-3 rounded-xl border cursor-pointer text-xs font-medium transition ${
                  paymentMethod === 'RAZORPAY_ONLINE'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY_ONLINE"
                  checked={paymentMethod === 'RAZORPAY_ONLINE'}
                  onChange={() => setPaymentMethod('RAZORPAY_ONLINE')}
                  className="mr-2 text-brand-600"
                />
                <div>
                  <span className="font-bold block">Razorpay Online</span>
                  <span className="text-[10px] text-slate-500">UPI / Cards / Net Banking</span>
                </div>
              </label>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Booking Summary</h4>
            <div className="flex justify-between text-slate-600">
              <span>Worker:</span>
              <span className="font-semibold text-slate-800">{worker?.userId?.name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service:</span>
              <span className="font-semibold text-brand-600">{selectedServiceObj?.name || worker?.profession}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Date & Time:</span>
              <span className="font-semibold text-slate-800">{date} at {time}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
              <span>Service Charge:</span>
              <span className="font-medium text-slate-800">₹{serviceCharge}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Booking Fee:</span>
              <span className="font-medium text-slate-800">₹{bookingFee}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount:</span>
              <span className="text-brand-600">₹{totalPrice}</span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Payable</span>
            <span className="text-xl font-black text-slate-900">₹{totalPrice}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center"
            >
              {loading ? (
                'Confirming...'
              ) : (
                <>
                  <span>Confirm Booking</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
