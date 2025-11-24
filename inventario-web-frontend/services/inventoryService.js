import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const InventoryService = {
  async getAll() {
    return await apiClient.get(ENDPOINTS.INVENTORY.BASE)
  },

  async getByLocation(id) {
    return await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/location/${id}`)
  },

  async transfer(data) {
    return await apiClient.post(ENDPOINTS.INVENTORY.TRANSFER, data)
  },

  async adjust(data) {
    return await apiClient.post(ENDPOINTS.INVENTORY.ADJUST, data)
  },
}
