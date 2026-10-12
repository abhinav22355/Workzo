import api from './api';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('workzo_token', res.data.token);
      localStorage.setItem('workzo_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('workzo_token', res.data.token);
      localStorage.setItem('workzo_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    if (res.data.user) {
      localStorage.setItem('workzo_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.user) {
      localStorage.setItem('workzo_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async becomeWorker(workerData) {
    const res = await api.post('/auth/become-worker', workerData);
    if (res.data.token) {
      localStorage.setItem('workzo_token', res.data.token);
      localStorage.setItem('workzo_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('workzo_token');
    localStorage.removeItem('workzo_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('workzo_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('workzo_token');
  },
};
