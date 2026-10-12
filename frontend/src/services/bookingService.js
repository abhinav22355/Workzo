import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  async getBookings(params = {}) {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  async getBookingById(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async updateBookingStatus(id, status, extra = {}) {
    const res = await api.put(`/bookings/${id}/status`, { status, ...extra });
    return res.data;
  },

  async processPayment(id, paymentData = {}) {
    const res = await api.post(`/bookings/${id}/payment`, paymentData);
    return res.data;
  },
};
