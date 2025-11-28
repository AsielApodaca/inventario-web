import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const InventoryService = {
  // GET /inventario/stock-total
  async getStockTotal() {
    return await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/stock-total`)
  },

  // GET /inventario/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/${id}`)
  },

  // GET /inventario/producto/:id_producto
  async getStockByProduct(productId) {
    return await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/producto/${productId}`)
  },

  // GET /inventario/producto/:id_producto/disponibilidad
  async checkAvailability(productId, params) {
    return await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/producto/${productId}/disponibilidad`, { params })
  },

  // GET /inventario/ubicacion/:id_ubicacion
  async getProductsByLocation(locationId) {
    return await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/ubicacion/${locationId}`)
  },

  // POST /inventario (Admin)
  async create(inventoryData) {
    return await apiClient.post(ENDPOINTS.INVENTORY.BASE, inventoryData)
  },

  // POST /inventario/transferir (Admin)
  async transfer(transferData) {
    return await apiClient.post(ENDPOINTS.INVENTORY.TRANSFER, transferData)
  },

  // PUT /inventario/:id/cantidad (Admin)
  async updateQuantity(id, quantityData) {
    return await apiClient.put(`${ENDPOINTS.INVENTORY.BASE}/${id}/cantidad`, quantityData)
  },

  // PATCH /inventario/:id/ajustar (Admin)
  async adjust(id, adjustmentData) {
    return await apiClient.patch(`${ENDPOINTS.INVENTORY.BASE}/${id}/ajustar`, adjustmentData)
  },

  // DELETE /inventario/:id (Admin)
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.INVENTORY.BASE}/${id}`)
  },
}
