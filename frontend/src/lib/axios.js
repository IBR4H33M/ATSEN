import axios from "axios";

// Determine API base URL: prefer VITE_API_URL, else if running on localhost use local backend, otherwise production
const envBase = import.meta.env.VITE_API_URL;
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const base = envBase || (isLocalhost ? 'http://localhost:5001/api' : 'https://atsen.app/api');
const api = axios.create({ baseURL: base });

// Debug logging for environment (shows whether VITE_API_URL is set and what base is chosen)
console.log('API Base URL chosen:', base);
console.log('VITE_API_URL present:', !!envBase, 'Running on localhost:', isLocalhost, 'Mode:', import.meta.env.MODE);

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
