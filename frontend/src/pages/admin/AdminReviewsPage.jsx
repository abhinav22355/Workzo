import React, { useState, useEffect } from 'react';
import { Star, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { reviewService } from '../../services/reviewService';
import { useToast } from '../../context/ToastContext';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminReviewsPage = () => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await reviewService.deleteReview(id);
      addToast('Review removed and worker rating recalculated', 'info');
      fetchReviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit customer ratings, prevent spam, and moderate inappropriate feedback
          </p>
        </div>
        <span className="text-xs text-slate-400 self-start sm:self-auto">
          Total Reviews: <strong className="text-white">{reviews.length}</strong>
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div className="bg-slate-950 rounded-2xl p-12 text-center text-slate-500 text-xs border border-slate-800">
          No customer reviews submitted yet.
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800/80">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.customerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.customerId?.name}`}
                      alt=""
                      className="w-8 h-8 rounded-full bg-slate-800"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{rev.customerId?.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Reviewed specialist <span className="text-brand-400 font-semibold">{rev.workerId?.name}</span> • {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <RatingStars rating={rev.rating} size="sm" />

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleDeleteReview(rev._id)}
                    className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center space-x-1"
                    title="Remove inappropriate review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Review</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
