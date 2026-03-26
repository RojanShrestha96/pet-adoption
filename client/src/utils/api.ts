import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const message = error.response?.data?.message || '';
      
      if (message.includes('expired') || message.includes('Invalid')) {
        // Clear expired token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show user-friendly message
        alert('Your session has expired. Please log in again.');
        
        // Redirect to login
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      const data = error.response.data;
      if (data.isBanned) {
        // Handle global ban logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show ban reason if available
        const reason = data.message || 'Account banned for violating terms.';
        window.location.href = `/login?error=banned&reason=${encodeURIComponent(reason)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
