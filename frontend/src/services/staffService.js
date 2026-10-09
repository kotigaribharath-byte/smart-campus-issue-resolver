import api from './api';

export const staffService = {
  getStaffMembers: async (params = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  getStaffIssues: async (staffId, params = {}) => {
    const response = await api.get(`/staff/${staffId}/issues`, { params });
    return response.data;
  },
};
