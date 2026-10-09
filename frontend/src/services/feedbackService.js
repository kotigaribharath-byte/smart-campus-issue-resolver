import api from './api';

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },

  getFeedback: async (params = {}) => {
    const response = await api.get('/feedback', { params });
    return response.data;
  },
};
