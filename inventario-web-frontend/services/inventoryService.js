import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

function extractArray(response) {
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export const InventoryService = {
  // GET /inventario/stock-total
  async getStockTotal() {
    const response = await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/stock-total`)
    return response.data;
  },

  // GET /inventario/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/${id}`)
    return response.data;
  },

  // GET /inventario/producto/:id_producto
  async getStockByProduct(productId) {
    const response = await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/producto/${productId}`)
    return extractArray(response);
  },

  // GET /inventario/producto/:id_producto/disponibilidad
  async checkAvailability(productId, params) {
    const response = await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/producto/${productId}/disponibilidad`, { params })
    return response.data;
  },

  // --- MÉTODO REQUERIDO POR TU MFE (Alias para compatibilidad) ---
  // Tu MFE llama a 'getByUbicacion', pero la plantilla tenía 'getProductsByLocation'
  // Aquí exponemos ambos para asegurar que funcione.
  async getByUbicacion(locationId) {
     return this.getProductsByLocation(locationId);
  },

  // GET /inventario/ubicacion/:id_ubicacion
  async getProductsByLocation(locationId) {
    try {
        const response = await apiClient.get(`${ENDPOINTS.INVENTORY.BASE}/ubicacion/${locationId}`)
        return { data: extractArray(response) };
    } catch (error) {
        return { data: [] };
    }
  },

  // --- MÉTODOS DE ESCRITURA ---

  async create(inventoryData) {
    return await apiClient.post(ENDPOINTS.INVENTORY.BASE, inventoryData)
  },

  async transfer(transferData) {
    return await apiClient.post(ENDPOINTS.INVENTORY.TRANSFER, transferData)
  },

  async updateQuantity(id, quantityData) {
    return await apiClient.put(`${ENDPOINTS.INVENTORY.BASE}/${id}/cantidad`, quantityData)
  },

  async adjust(id, adjustmentData) {
    return await apiClient.patch(`${ENDPOINTS.INVENTORY.BASE}/${id}/ajustar`, adjustmentData)
  },

  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.INVENTORY.BASE}/${id}`)
  },
}