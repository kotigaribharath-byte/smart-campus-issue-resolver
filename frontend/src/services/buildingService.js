import api from './api';

export const buildingService = {
  getBuildings: async () => {
    const response = await api.get('/buildings');
    return response.data;
  },

  createBuilding: async (data) => {
    const response = await api.post('/buildings', data);
    return response.data;
  },

  updateBuilding: async (id, data) => {
    const response = await api.put(`/buildings/${id}`, data);
    return response.data;
  },

  deleteBuilding: async (id) => {
    const response = await api.delete(`/buildings/${id}`);
    return response.data;
  },
};
