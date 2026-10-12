import api from './api';

export const reviewService = {
  async createReview(reviewData) {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },

  async getWorkerReviews(workerId) {
    const res = await api.get(`/reviews/worker/${workerId}`);
    return res.data;
  },

  async deleteReview(id) {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};
