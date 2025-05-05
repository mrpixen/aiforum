import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api' : '/api');

// Add logging for base URL to debug
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to log the full URL and add the auth token
api.interceptors.request.use((config) => {
  if (config.baseURL && config.url) {
    console.log('API request to:', config.baseURL + config.url);  // Only log if both are defined
  } else {
    console.log('API request: URL could not be constructed');  // Fallback logging
  }
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response) {
      console.error('API response error:', error.response.data);  // Log error responses
    }
    return Promise.reject(error);
  }
);

export default api; 