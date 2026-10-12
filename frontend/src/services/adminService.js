import api from './api';

export const adminService = {
  async getDashboardStats() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async toggleUserStatus(id) {
    const res = await api.put(`/admin/users/${id}/status`);
    return res.data;
  },

  async getWorkers(params = {}) {
    const res = await api.get('/admin/workers', { params });
    return res.data;
  },

  async verifyWorker(id, status) {
    const res = await api.put(`/admin/workers/${id}/verify`, { status });
    return res.data;
  },

  async getAllBookings(params = {}) {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  async getAllPayments() {
    const res = await api.get('/admin/payments');
    return res.data;
  },

  async getAllReviews() {
    const res = await api.get('/admin/reviews');
    return res.data;
  },
};
