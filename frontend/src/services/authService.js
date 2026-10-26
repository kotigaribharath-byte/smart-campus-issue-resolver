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

  sendLoginCode: async (email) => {
    const response = await api.post('/auth/send-login-code', { email });
    return response.data;
  },

  verifyLoginCode: async ({ email, code }) => {
    const response = await api.post('/auth/verify-login-code', { email, code });
    if (response.data.token) {
      localStorage.setItem('campusfix_token', response.data.token);
      localStorage.setItem('campusfix_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },


  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // If auto-authenticated (not requiring verification), save token
    if (response.data.token) {
      localStorage.setItem('campusfix_token', response.data.token);
      localStorage.setItem('campusfix_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  verifyEmail: async ({ email, otp }) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    if (response.data.token) {
      localStorage.setItem('campusfix_token', response.data.token);
      localStorage.setItem('campusfix_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  resendOtp: async ({ email, type = 'REGISTER' }) => {
    const response = await api.post('/auth/resend-otp', { email, type });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
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
