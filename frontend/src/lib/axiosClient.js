import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HttpOnly refresh cookie automatically
});

// In-memory only -- deliberately never localStorage/sessionStorage, to
// reduce the access token's exposure to XSS. Lost on full page reload by
// design; AuthContext re-establishes it via /auth/refresh on mount.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On a 401, attempt exactly ONE refresh-and-retry per request -- a second
// 401 after that means the session is genuinely gone, not just stale.
let refreshPromise = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status === 401 && !config._retried && !config.url.includes('/auth/')) {
      config._retried = true;

      try {
        refreshPromise ??= axiosClient.post('/auth/refresh');
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.data.accessToken);
        config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosClient(config);
      } catch (refreshError) {
        refreshPromise = null;
        setAccessToken(null);
        window.location.assign('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);