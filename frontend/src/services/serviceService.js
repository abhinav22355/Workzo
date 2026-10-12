import api from './api';

export const serviceService = {
  async getServices(includeInactive = false) {
    const res = await api.get('/services', {
      params: { includeInactive: includeInactive ? 'true' : 'false' },
    });
    return res.data;
  },

  async getServiceById(id) {
    const res = await api.get(`/services/${id}`);
    return res.data;
  },

  async createService(data) {
    const res = await api.post('/services', data);
    return res.data;
  },

  async updateService(id, data) {
    const res = await api.put(`/services/${id}`, data);
    return res.data;
  },

  async deleteService(id) {
    const res = await api.delete(`/services/${id}`);
    return res.data;
  },
};
