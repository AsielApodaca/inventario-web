import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const MovementService = {
  // GET /movimientos-inventario/tipos
  async getMovementTypes() {
    return await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/tipos`)
  },

  // GET /movimientos-inventario/ultimos
  async getLatest() {
    return await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/ultimos`)
  },

  // GET /movimientos-inventario/fecha?inicio=...&fin=...
  async getByDate(dateParams) {
    return await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/fecha`, { params: dateParams })
  },

  // GET /movimientos-inventario/reporte?params...
  async getReport(reportParams) {
    return await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/reporte`, { params: reportParams })
  },

  // GET /movimientos-inventario/producto/:id_producto
  async getByProduct(productId) {
    return await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/producto/${productId}`)
  },

  // GET /movimientos-inventario/producto/:id_producto/resumen
  async getProductSummary(productId) {
    return await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/producto/${productId}/resumen`)
  },

  // GET /movimientos-inventario/:id
  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/${id}`)
  },

  // POST /movimientos-inventario (Admin)
  async create(movementData) {
    return await apiClient.post(ENDPOINTS.MOVEMENTS.BASE, movementData)
  },

  // POST /movimientos-inventario/entrada (Admin)
  async createEntry(entryData) {
    return await apiClient.post(`${ENDPOINTS.MOVEMENTS.BASE}/entrada`, entryData)
  },

  // POST /movimientos-inventario/salida (Admin)
  async createExit(exitData) {
    return await apiClient.post(`${ENDPOINTS.MOVEMENTS.BASE}/salida`, exitData)
  },

  // POST /movimientos-inventario/ajuste (Admin)
  async createAdjustment(adjustmentData) {
    return await apiClient.post(`${ENDPOINTS.MOVEMENTS.BASE}/ajuste`, adjustmentData)
  },
}
