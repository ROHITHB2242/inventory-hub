// src/services/authService.js
// Purpose: API service caller wrapping authentication, login, and sign-up.

import api from './api';

const authService = {
  /**
   * Registers a new user.
   */
  async signup(name, email, password) {
    const response = await api.post('/api/auth/signup', { name, email, password });
    return response.data;
  },

  /**
   * Log in standard credential-based user.
   */
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Log out active user and clear authentication cookies.
   */
  async logout() {
    const response = await api.post('/api/auth/logout');
    localStorage.removeItem('access_token');
    return response.data;
  },

  /**
   * Retrieves active user data.
   */
  async getMe() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Retrieves Google login redirection URL.
   */
  async getGoogleUrl() {
    const response = await api.get('/api/auth/google/url');
    return response.data;
  },

  /**
   * Exchanges Google auth code for active JWT tokens.
   */
  async googleCallback(code) {
    const response = await api.post('/api/auth/google/callback', { code });
    return response.data;
  }
};

export default authService;
