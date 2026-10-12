import api from './api';

export const workerService = {
  async getWorkers(filters = {}) {
    const res = await api.get('/workers', { params: filters });
    return res.data;
  },

  async getWorkerById(id) {
    const res = await api.get(`/workers/${id}`);
    return res.data;
  },

  async getWorkerAvailability(id, date) {
    const res = await api.get(`/workers/${id}/availability`, {
      params: { date },
    });
    return res.data;
  },

  async updateWorkerProfile(profileData) {
    const res = await api.put('/workers/profile', profileData);
    return res.data;
  },
};
