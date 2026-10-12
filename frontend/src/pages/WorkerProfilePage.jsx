import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  Calendar,
  Clock,
  MessageSquare,
  ArrowRight,
  Phone,
  Mail,
  X,
  Send,
  Award,
} from 'lucide-react';
import { workerService } from '../services/workerService';
import { reviewService } from '../services/reviewService';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const WorkerProfilePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const fetchWorkerData = async () => {
      setLoading(true);
      try {
        const res = await workerService.getWorkerById(id);
        setWorker(res.data);
        setReviews(res.reviews || []);
      } catch (err) {
        console.error('Failed to load worker profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerData();
  }, [id]);

  const handleSendContact = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    addToast(`Message sent to ${worker?.userId?.name}. They will reach out to you shortly.`, 'success');
    setTimeout(() => {
      setShowContactModal(false);
      setContactSent(false);
      setContactMessage('');
    }, 1500);
  };

  if (loading) {
    return <LoadingSpinner text="Loading worker profile..." />;
  }

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Worker profile not found</h2>
        <Link to="/workers" className="mt-4 inline-block text-brand-600 font-semibold text-sm">
          ← Return to workers directory
        </Link>
      </div>
    );
  }

  const workerUser = worker.userId || {};
  const isVerified = worker.verificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Info, Experience, Skills, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Profile Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <img
                  src={workerUser.profileImage || worker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${workerUser.name}`}
                  alt={workerUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover bg-slate-100 border-2 border-white shadow-md"
                />
                {isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-slate-900">{workerUser.name}</h1>
                  {isVerified && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified Specialist
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-brand-600 mt-1">{worker.profession}</p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <RatingStars rating={worker.rating} totalReviews={worker.totalReviews} size="md" />
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-brand-600" />
                    <span className="font-semibold text-slate-800">{worker.completedJobs} jobs completed</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{worker.serviceArea}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges / Guarantees */}
            {worker.badges && worker.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
                {worker.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">About {workerUser.name}</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {worker.description || `${workerUser.name} is a skilled service specialist with over ${worker.experience} years of experience in ${worker.profession}.`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total Experience</span>
                <span className="text-base font-extrabold text-slate-800">{worker.experience} Years</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Service Rating</span>
                <span className="text-base font-extrabold text-slate-800">{Number(worker.rating).toFixed(1)} / 5.0</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Jobs Delivered</span>
                <span className="text-base font-extrabold text-slate-800">{worker.completedJobs} Successfully</span>
              </div>
            </div>
          </div>

          {/* Skills & Specialties */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customer Reviews</h3>
                <p className="text-xs text-slate-400">{reviews.length} verified ratings</p>
              </div>
              <div className="flex items-center space-x-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-black text-amber-800">{Number(worker.rating).toFixed(1)}</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No reviews yet for this professional. Be the first to book!
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev._id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rev.customerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.customerId?.name}`}
                          alt={rev.customerId?.name}
                          className="w-8 h-8 rounded-full object-cover bg-slate-100"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">{rev.customerId?.name}</h5>
                          <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-11">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Booking Action Box & Schedule */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-24 space-y-6">
            {/* Price Header */}
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                  Starting Rate
                </span>
                <span className="text-3xl font-black text-slate-900">
                  ₹{worker.pricing?.startingRate || 299}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Pay After Service
              </span>
            </div>

            {/* Rates breakdown */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Hourly Charge:</span>
                <span className="font-semibold text-slate-800">₹{worker.pricing?.hourlyRate || 349}/hr</span>
              </div>
              <div className="flex justify-between">
                <span>Visiting / Inspection Fee:</span>
                <span className="font-semibold text-slate-800">₹{worker.pricing?.visitingCharge || 99}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking Guarantee Fee:</span>
                <span className="font-semibold text-slate-800">₹50</span>
              </div>
            </div>

            {/* Availability info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center text-slate-700 font-bold">
                <Calendar className="w-4 h-4 mr-2 text-brand-600" /> Working Schedule
              </div>
              <p className="text-[11px] text-slate-500">
                {worker.availability?.days?.join(', ') || 'Monday - Saturday'}
              </p>
              <div className="flex items-center text-[11px] text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {worker.availability?.workingHours?.start || '09:00'} - {worker.availability?.workingHours?.end || '19:00'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Book This Professional</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Contact Professional</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Free cancellation before job start. No advance payment needed.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          worker={worker}
          initialServiceId={serviceId}
          onClose={() => setShowBookingModal(false)}
          onSuccess={(booking) => {
            setShowBookingModal(false);
            navigate(`/bookings/${booking._id}`);
          }}
        />
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Message {workerUser.name}
              </h3>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendContact} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Requirement or Inquiry
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Ask regarding availability, preliminary estimate, or material requirements..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={contactSent}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{contactSent ? 'Message Sent!' : 'Send Inquiry Message'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfilePage;
