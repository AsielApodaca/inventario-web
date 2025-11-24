import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const UserService = {
  // GET /usuarios (Admin)
  async getAll() {
    return await apiClient.get(ENDPOINTS.USERS.BASE)
  },

  // GET /usuarios/email/:email (Admin)
  async getByEmail(email) {
    return await apiClient.get(`${ENDPOINTS.USERS.BASE}/email/${email}`)
  },

  // GET /usuarios/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.USERS.BASE}/${id}`)
  },

  // GET /usuarios/:id/estadisticas
  async getStats(id) {
    return await apiClient.get(`${ENDPOINTS.USERS.BASE}/${id}/estadisticas`)
  },

  // PUT /usuarios/:id (Admin)
  async update(id, userData) {
    return await apiClient.put(`${ENDPOINTS.USERS.BASE}/${id}`, userData)
  },

  // PATCH /usuarios/:id/password
  async changePassword(id, passwordData) {
    return await apiClient.patch(`${ENDPOINTS.USERS.BASE}/${id}/password`, passwordData)
  },

  // PATCH /usuarios/:id/estado (Admin)
  async changeStatus(id, statusData) {
    return await apiClient.patch(`${ENDPOINTS.USERS.BASE}/${id}/estado`, statusData)
  },

  // POST /usuarios/:id/registrar-sesion
  async registerSession(id) {
    return await apiClient.post(`${ENDPOINTS.USERS.BASE}/${id}/registrar-sesion`)
  },

  // POST /usuarios/verificar-permisos (Admin)
  async verifyPermissions(permissionData) {
    return await apiClient.post(`${ENDPOINTS.USERS.BASE}/verificar-permisos`, permissionData)
  },

  // DELETE /usuarios/:id (Admin)
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.USERS.BASE}/${id}`)
  },
}
