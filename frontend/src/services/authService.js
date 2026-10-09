import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('campusfix_token', response.data.token);
      localStorage.setItem('campusfix_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('campusfix_token', response.data.token);
      localStorage.setItem('campusfix_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/update-profile', profileData);
    if (response.data.user) {
      localStorage.setItem('campusfix_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('campusfix_token');
    localStorage.removeItem('campusfix_user');
  },
};
