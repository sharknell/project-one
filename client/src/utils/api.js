import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/profile",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;