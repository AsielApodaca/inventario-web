import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const LocationService = {
  // POST /ubicaciones (Admin)
  async create(locationData) {
    return await apiClient.post(ENDPOINTS.LOCATIONS.BASE, locationData)
  },

  // GET /ubicaciones/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.LOCATIONS.BASE}/${id}`)
  },

  // PUT /ubicaciones/:id (Admin)
  async update(id, locationData) {
    return await apiClient.put(`${ENDPOINTS.LOCATIONS.BASE}/${id}`, locationData)
  },
}
