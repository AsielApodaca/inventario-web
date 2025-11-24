import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const WarehouseService = {
  // GET /almacenes
  async getAll() {
    return await apiClient.get(ENDPOINTS.WAREHOUSES.BASE)
  },

  // GET /almacenes/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`)
  },

  // POST /almacenes (Admin)
  async create(warehouseData) {
    return await apiClient.post(ENDPOINTS.WAREHOUSES.BASE, warehouseData)
  },

  // PUT /almacenes/:id (Admin)
  async update(id, warehouseData) {
    return await apiClient.put(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`, warehouseData)
  },

  // DELETE /almacenes/:id (Admin)
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`)
  },
}
