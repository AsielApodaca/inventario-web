import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

// Misma función helper
function extractArray(response) {
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && data.data && Array.isArray(data.data.rows)) return data.data.rows;
  if (data && data.data && Array.isArray(data.data.data)) return data.data.data;
  
  if (data && typeof data === 'object') {
     const keys = Object.keys(data);
     for (const key of keys) {
       if (Array.isArray(data[key])) return data[key];
     }
  }
  return [];
}

export const OrderService = {
  // GET /ordenes-compra
  async getAll(filters) {
    try {
      const response = await apiClient.get(ENDPOINTS.ORDERS.BASE, { params: filters })
      return extractArray(response);
    } catch (error) {
      console.error("OrderService.getAll error:", error);
      return [];
    }
  },

  // GET /ordenes-compra/estados/disponibles
  async getAvailableStates() {
    const response = await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/estados/disponibles`)
    return extractArray(response);
  },

  // GET /ordenes-compra/proveedor/:id_proveedor
  async getByProvider(providerId) {
    const response = await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/proveedor/${providerId}`)
    return extractArray(response);
  },

  // GET /ordenes-compra/estado/:estado
  async getByState(state) {
    const response = await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/estado/${state}`)
    return extractArray(response);
  },

  // GET /ordenes-compra/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${id}`)
    return response.data;
  },

  // GET /ordenes-compra/:id/detalles
  async getDetails(id) {
    const response = await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${id}/detalles`)
    return extractArray(response);
  },

  // GET /ordenes-compra/:id/total
  async getTotal(id) {
    const response = await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${id}/total`)
    return response.data || 0;
  },

  // --- MÉTODOS DE ESCRITURA ---
  async create(orderData) { return await apiClient.post(ENDPOINTS.ORDERS.BASE, orderData) },
  async cancel(id) { return await apiClient.post(`${ENDPOINTS.ORDERS.BASE}/${id}/cancelar`) },
  async updateStatus(id, statusData) { return await apiClient.patch(`${ENDPOINTS.ORDERS.BASE}/${id}/estado`, statusData) },
}