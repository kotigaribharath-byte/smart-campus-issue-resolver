import api from './api';

export const dashboardService = {
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getStaffDashboard: async () => {
    const response = await api.get('/dashboard/staff');
    return response.data;
  },

  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },
};
