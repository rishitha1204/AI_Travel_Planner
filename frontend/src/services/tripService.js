import { axiosClient } from '../lib/axiosClient.js';

export const tripService = {
  async listTrips(params = {}) {
    const { data } = await axiosClient.get('/trips', { params });
    return data.data; // { trips, pagination }
  },

  async getTrip(tripId) {
    const { data } = await axiosClient.get(`/trips/${tripId}`);
    return data.data.trip;
  },

  async createTrip(payload) {
    const { data } = await axiosClient.post('/trips', payload);
    return data.data.trip;
  },

  async updateTrip(tripId, payload) {
    const { data } = await axiosClient.put(`/trips/${tripId}`, payload);
    return data.data.trip;
  },

  async deleteTrip(tripId) {
    await axiosClient.delete(`/trips/${tripId}`);
  },

  async patchItinerary(tripId, patch) {
    const { data } = await axiosClient.patch(`/trips/${tripId}/itinerary`, patch);
    return data.data.trip;
  },

  async generateItinerary(tripId, { preferences, pace } = {}) {
    const { data } = await axiosClient.post(`/trips/${tripId}/generate-itinerary`, { preferences, pace });
    return data.data; // { trip, costReconciliation }
  },
};