import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const OrderService = {
  // GET /ordenes-compra/estados/disponibles
  async getAvailableStates() {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/estados/disponibles`)
  },

  // GET /ordenes-compra?filters...
  async getAll(filters) {
    return await apiClient.get(ENDPOINTS.ORDERS.BASE, { params: filters })
  },

  // GET /ordenes-compra/proveedor/:id_proveedor
  async getByProvider(providerId) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/proveedor/${providerId}`)
  },

  // GET /ordenes-compra/estado/:estado
  async getByState(state) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/estado/${state}`)
  },

  // GET /ordenes-compra/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${id}`)
  },

  // GET /ordenes-compra/:id/detalles
  async getDetails(id) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${id}/detalles`)
  },

  // GET /ordenes-compra/:id/total
  async getTotal(id) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${id}/total`)
  },

  // POST /ordenes-compra (Admin)
  async create(orderData) {
    return await apiClient.post(ENDPOINTS.ORDERS.BASE, orderData)
  },

  // POST /ordenes-compra/:id/cancelar (Admin)
  async cancel(id) {
    return await apiClient.post(`${ENDPOINTS.ORDERS.BASE}/${id}/cancelar`)
  },

  // PATCH /ordenes-compra/:id/estado (Admin)
  async updateStatus(id, statusData) {
    return await apiClient.patch(`${ENDPOINTS.ORDERS.BASE}/${id}/estado`, statusData)
  },
}
