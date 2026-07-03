// src/services/adminService.js
// Purpose: API service caller wrapping raw MongoDB collections viewing/deleting for admin.

import api from './api';

const adminService = {
  /**
   * Fetch all registered users in the database
   */
  async fetchUsers() {
    const response = await api.get('/api/admin/db/users');
    return response.data;
  },

  /**
   * Fetch all products in the database
   */
  async fetchProducts() {
    const response = await api.get('/api/admin/db/products');
    return response.data;
  },

  /**
   * Delete user by ID
   */
  async deleteUser(userId) {
    const response = await api.delete(`/api/admin/db/users/${userId}`);
    return response.data;
  },

  /**
   * Delete product by ID
   */
  async deleteProduct(productId) {
    const response = await api.delete(`/api/admin/db/products/${productId}`);
    return response.data;
  },
};

export default adminService;
