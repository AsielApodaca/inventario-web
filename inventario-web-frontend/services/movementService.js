import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const MovementService = {
  async getAll() {
    return await apiClient.get(ENDPOINTS.MOVEMENTS.BASE)
  },

  async create(movement) {
    return await apiClient.post(ENDPOINTS.MOVEMENTS.BASE, movement)
  },

  async getReports() {
    return await apiClient.get(ENDPOINTS.MOVEMENTS.REPORTS)
  },
}
