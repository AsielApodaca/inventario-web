import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const OrderService = {
  async getAll() {
    return await apiClient.get(ENDPOINTS.ORDERS.BASE)
  },

  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${id}`)
  },

  async create(order) {
    return await apiClient.post(ENDPOINTS.ORDERS.BASE, order)
  },

  async updateStatus(id, status) {
    return await apiClient.put(`${ENDPOINTS.ORDERS.BASE}/${id}/status`, { status })
  },
}
