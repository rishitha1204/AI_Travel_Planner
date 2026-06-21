import { axiosClient } from '../lib/axiosClient.js';

export const healthScoreService = {
  async computeScore(tripId) {
    const response = await axiosClient.post(`/trips/${tripId}/health-score`);
    return response.data.data.score;
  },

  async getLatestScore(tripId) {
    const response = await axiosClient.get(`/trips/${tripId}/health-score`);
    return response.data.data.score;
  },

  async getScoreHistory(tripId) {
    const response = await axiosClient.get(`/trips/${tripId}/health-score/history`);
    return response.data.data.scores;
  },
};