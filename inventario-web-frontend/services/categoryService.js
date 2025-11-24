import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const CategoryService = {
  async getAll() {
    return await apiClient.get(ENDPOINTS.CATEGORIES.BASE)
  },

  async getRootCategories() {
    return await apiClient.get(`${ENDPOINTS.CATEGORIES.BASE}/raiz`)
  },

  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.CATEGORIES.BASE}/${id}`)
  },

  async getSubcategories(id) {
    return await apiClient.get(`${ENDPOINTS.CATEGORIES.BASE}/${id}/subcategorias`)
  },

  // Admin only
  async create(category) {
    return await apiClient.post(ENDPOINTS.CATEGORIES.BASE, category)
  },

  // Admin only
  async update(id, category) {
    return await apiClient.put(`${ENDPOINTS.CATEGORIES.BASE}/${id}`, category)
  },
}
