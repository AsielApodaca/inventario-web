import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const UserService = {
  // GET /usuarios (Admin)
  async getAll() {
    return await apiClient.get(ENDPOINTS.USERS.BASE)
  },

  // GET /usuarios/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.USERS.BASE}/${id}`)
  },

  // PUT /usuarios/:id (Admin)
  async update(id, userData) {
    return await apiClient.put(`${ENDPOINTS.USERS.BASE}/${id}`, userData)
  },

  // PATCH /usuarios/:id/password
  async changePassword(id, passwordData) {
    return await apiClient.patch(`${ENDPOINTS.USERS.BASE}/${id}/password`, passwordData)
  },

  // DELETE /usuarios/:id (Admin)
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.USERS.BASE}/${id}`)
  },
}
