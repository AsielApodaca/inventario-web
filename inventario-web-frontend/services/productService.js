import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const ProductService = {
  // GET /productos
  async getAll(params = {}) {
    return await apiClient.get(ENDPOINTS.PRODUCTS.BASE, { params })
  },

  // GET /productos/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}`)
  },

  // GET /productos/buscar?nombre=...&id_categoria=...
  async search(criteria) {
    return await apiClient.get(ENDPOINTS.PRODUCTS.SEARCH, { params: criteria })
  },

  // GET /productos/codigo/:codigo
  async getByCode(code) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.BY_CODE}/${code}`)
  },

  // GET /productos/categoria/:id_categoria
  async getByCategory(categoryId) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.BY_CATEGORY}/${categoryId}`)
  },

  // GET /productos/bajo-stock
  async getLowStock() {
    return await apiClient.get(ENDPOINTS.PRODUCTS.LOW_STOCK)
  },

  // GET /productos/:id/inventario
  async getInventory(id) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}/inventario`)
  },

  // GET /productos/:id/movimientos
  async getMovements(id) {
    return await apiClient.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}/movimientos`)
  },

  // POST /productos (Admin)
  async create(product) {
    return await apiClient.post(ENDPOINTS.PRODUCTS.BASE, product)
  },

  // PUT /productos/:id (Admin)
  async update(id, product) {
    return await apiClient.put(`${ENDPOINTS.PRODUCTS.BASE}/${id}`, product)
  },

  // PATCH /productos/:id/estado (Admin)
  async changeStatus(id, statusData) {
    return await apiClient.patch(`${ENDPOINTS.PRODUCTS.BASE}/${id}/estado`, statusData)
  },

  // DELETE /productos/:id (Admin)
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.PRODUCTS.BASE}/${id}`)
  },
}
