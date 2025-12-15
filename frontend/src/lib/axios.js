import axios from "axios";

const base = import.meta.env.VITE_API_URL || "https://atsen.app/api";
const api = axios.create({ baseURL: base });

// Debug logging for environment (shows whether VITE_API_URL is set)
console.log('API Base URL:', base);
console.log('VITE_API_URL set:', !!import.meta.env.VITE_API_URL, 'Mode:', import.meta.env.MODE);

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
