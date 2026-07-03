// src/services/api.js
// Purpose: Configure Axios instance with header interceptors and automated JWT refresh logic.

import axios from 'axios';

// Create central Axios instance with environment-defined base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://inventory-hub-backend.onrender.com',
  withCredentials: true, // Send HTTP-only session cookies in cross-origin requests
});

// Request Interceptor: Inject JWT access token into authorization headers
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response Interceptor: Intercept 401 failures and attempt token renewal
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if request failed due to unauthorized token expiration (401)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/auth/login') &&
      !originalRequest.url.includes('/api/auth/signup') &&
      !originalRequest.url.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true; // Mark request to prevent infinite loops

      try {
        // Call the token renewal route (sends cookies automatically)
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = refreshResponse.data;
        if (access_token) {
          // Save new access token and retry the original query
          localStorage.setItem('access_token', access_token);
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token has expired or is invalid. Remove access token.
        localStorage.removeItem('access_token');

        // Dispatch global event for context to catch and redirect user
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      }
    }

    // Return the error for specific routing pages to handle
    return Promise.reject(error);
  }
);

export default api;
