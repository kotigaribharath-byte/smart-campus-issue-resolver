import api from './api';

export const chatService = {
  /**
   * Send user message to NVIDIA NIM AI Assistant
   * @param {string} message 
   * @param {Array} history 
   * @returns {Promise<{success: boolean, reply: string, matchedIssues: Array}>}
   */
  async sendMessage(message, history = []) {
    const res = await api.post('/chat', { message, history });
    return res.data;
  },
};
