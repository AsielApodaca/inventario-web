import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const SupplierService = {
  async getAll() {
    return await apiClient.get(ENDPOINTS.SUPPLIERS.BASE)
  },

  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`)
  },

  async create(supplier) {
    return await apiClient.post(ENDPOINTS.SUPPLIERS.BASE, supplier)
  },

  async update(id, supplier) {
    return await apiClient.put(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`, supplier)
  },

  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`)
  },
}
