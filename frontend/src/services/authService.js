import { axiosClient } from '../lib/axiosClient.js';

export const authService = {
  async register({ name, email, password }) {
    const { data } = await axiosClient.post('/auth/register', { name, email, password });
    return data.data; // { user, accessToken }
  },

  async login({ email, password }) {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    return data.data; // { user, accessToken }
  },

  async refresh() {
    const { data } = await axiosClient.post('/auth/refresh');
    return data.data; // { user, accessToken }
  },

  async logout() {
    await axiosClient.post('/auth/logout');
  },

  async getCurrentUser() {
    const { data } = await axiosClient.get('/auth/me');
    return data.data.user;
  },
};