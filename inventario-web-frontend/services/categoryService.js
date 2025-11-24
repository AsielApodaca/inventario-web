import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const CategoryService = {
  async getAll() {
    return await apiClient.get(ENDPOINTS.CATEGORIES.BASE)
  },

  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.CATEGORIES.BASE}/${id}`)
  },

  async create(category) {
    return await apiClient.post(ENDPOINTS.CATEGORIES.BASE, category)
  },

  async update(id, category) {
    return await apiClient.put(`${ENDPOINTS.CATEGORIES.BASE}/${id}`, category)
  },

  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.CATEGORIES.BASE}/${id}`)
  },
}
