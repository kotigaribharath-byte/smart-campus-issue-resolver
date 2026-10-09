import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to automatically append JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for centralized error management
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid and not on login page
      const isAuthPath = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthPath && localStorage.getItem('campusfix_token')) {
        localStorage.removeItem('campusfix_token');
        localStorage.removeItem('campusfix_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
