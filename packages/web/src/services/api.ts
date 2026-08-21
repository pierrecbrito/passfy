import axios from 'axios';

function getBaseUrl(): string {

  let url = (import.meta.env.VITE_API_URL as string) || '/api';
  url = url.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // If it's a full host URL (e.g. https://passfy.up.railway.app) without /api, append /api
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
  }
  return url;
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@passfy:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, clean invalid token
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/ticket/share') &&
        !currentPath.includes('/register')
      ) {
        // keep session clean
      }
    }
    return Promise.reject(error);
  }
);

export { api };
