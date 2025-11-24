import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const ProductService = {
  async getAll() {
    return await apiClient.get(ENDPOINTS.PRODUCTS.BASE)
  },

  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}`)
  },

  async create(product) {
    return await apiClient.post(ENDPOINTS.PRODUCTS.BASE, product)
  },

  async update(id, product) {
    return await apiClient.put(`${ENDPOINTS.PRODUCTS.BASE}/${id}`, product)
  },

  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.PRODUCTS.BASE}/${id}`)
  },

  async search(query) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.SEARCH}?q=${query}`)
  },

  async getByCategory(categoryId) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.BY_CATEGORY}/${categoryId}`)
  },
}
