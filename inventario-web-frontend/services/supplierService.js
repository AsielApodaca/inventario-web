import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const SupplierService = {
  // GET /proveedores
  async getAll(params = {}) {
    return await apiClient.get(ENDPOINTS.SUPPLIERS.BASE, { params })
  },

  // GET /proveedores/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`)
  },

  // GET /proveedores/buscar?nombre=...
  async search(criteria) {
    return await apiClient.get(`${ENDPOINTS.SUPPLIERS.BASE}/buscar`, { params: criteria })
  },

  // GET /proveedores/:id/estadisticas
  async getStats(id) {
    return await apiClient.get(`${ENDPOINTS.SUPPLIERS.BASE}/${id}/estadisticas`)
  },

  // GET /proveedores/:id/productos
  async getProducts(id) {
    return await apiClient.get(`${ENDPOINTS.SUPPLIERS.BASE}/${id}/productos`)
  },

  // GET /proveedores/:id/ordenes
  async getOrders(id) {
    return await apiClient.get(`${ENDPOINTS.SUPPLIERS.BASE}/${id}/ordenes`)
  },

  // POST /proveedores (Admin)
  async create(supplier) {
    return await apiClient.post(ENDPOINTS.SUPPLIERS.BASE, supplier)
  },

  // PUT /proveedores/:id (Admin)
  async update(id, supplier) {
    return await apiClient.put(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`, supplier)
  },

  // PATCH /proveedores/:id/estado (Admin)
  async changeStatus(id, statusData) {
    return await apiClient.patch(`${ENDPOINTS.SUPPLIERS.BASE}/${id}/estado`, statusData)
  },

  // DELETE /proveedores/:id (Admin)
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`)
  },
}
