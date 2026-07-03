// src/services/itemService.js
// Purpose: API service caller wrapping CRUD operations and dashboard analytics.

import api from './api';

const itemService = {
  /**
   * Retrieves products using pagination, sorting, and search query parameters.
   */
  async getProducts(params = {}) {
    const response = await api.get('/api/endpoints/products', { params });
    return response.data;
  },

  /**
   * Retrieves a single product detail by ID.
   */
  async getProductById(id) {
    const response = await api.get(`/api/endpoints/products/${id}`);
    return response.data;
  },

  /**
   * Registers a new product.
   */
  async createProduct(productData) {
    const response = await api.post('/api/endpoints/products', productData);
    return response.data;
  },

  /**
   * Updates an existing product.
   */
  async updateProduct(id, productData) {
    const response = await api.put(`/api/endpoints/products/${id}`, productData);
    return response.data;
  },

  /**
   * Deletes a product by ID.
   */
  async deleteProduct(id) {
    const response = await api.delete(`/api/endpoints/products/${id}`);
    return response.data;
  },

  /**
   * Retrieves user dashboard KPI metrics.
   */
  async getStats() {
    const response = await api.get('/api/endpoints/products/stats');
    return response.data;
  }
};

export default itemService;
