import api from './api';

export const issueService = {
  getIssues: async (params = {}) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  getIssueById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  createIssue: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },

  updateIssue: async (id, issueData) => {
    const response = await api.put(`/issues/${id}`, issueData);
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await api.put(`/issues/${id}/status`, statusData);
    return response.data;
  },

  assignStaff: async (id, assignmentData) => {
    const response = await api.put(`/issues/${id}/assign`, assignmentData);
    return response.data;
  },

  addComment: async (id, commentData) => {
    const response = await api.post(`/issues/${id}/comments`, commentData);
    return response.data;
  },

  reopenIssue: async (id, reasonData) => {
    const response = await api.post(`/issues/${id}/reopen`, reasonData);
    return response.data;
  },

  deleteIssue: async (id) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  },
};
