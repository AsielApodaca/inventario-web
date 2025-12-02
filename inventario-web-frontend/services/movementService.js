import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

// --- EXTRACTOR DEEP DIVE (3 NIVELES) ---
function extractArray(response) {
  const resData = response.data;

  // 1. Nivel directo [ ... ]
  if (Array.isArray(resData)) return resData;

  // 2. Nivel estándar { data: [ ... ] }
  if (resData && Array.isArray(resData.data)) return resData.data;

  // 3. Nivel Paginación Sequelize { data: { rows: [ ... ] } }
  if (resData && resData.data && Array.isArray(resData.data.rows)) return resData.data.rows;

  // 4. ¡AQUÍ ESTÁ TU CASO! -> { data: { data: [ ... ] } }
  if (resData && resData.data && Array.isArray(resData.data.data)) {
      return resData.data.data;
  }

  // 5. Búsqueda de emergencia (Cualquier array profundo)
  if (resData && typeof resData === 'object') {
      // Buscar en propiedades de primer nivel
      for (const key in resData) {
          if (Array.isArray(resData[key])) return resData[key];
          
          // Buscar en propiedades de segundo nivel
          if (typeof resData[key] === 'object' && resData[key] !== null) {
              const subObj = resData[key];
              for (const subKey in subObj) {
                  if (Array.isArray(subObj[subKey])) return subObj[subKey];
              }
          }
      }
  }

  return [];
}

export const MovementService = {
  // GET /movimientos-inventario
  async getAll(filters = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.MOVEMENTS.BASE, { params: filters })
      return extractArray(response);
    } catch (error) {
      console.error("MovementService error:", error);
      return [];
    }
  },

  // GET /movimientos-inventario/ultimos
  async getLatest() {
    const response = await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/ultimos`)
    return extractArray(response);
  },
  
  // GET /movimientos-inventario/tipos
  async getMovementTypes() {
    const response = await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/tipos`)
    return extractArray(response);
  },

  // GET /movimientos-inventario/fecha
  async getByDate(dateParams) {
    const response = await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/fecha`, { params: dateParams })
    return extractArray(response);
  },

  // GET /movimientos-inventario/reporte
  async getReport(reportParams) {
    const response = await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/reporte`, { params: reportParams })
    return response.data;
  },

  // GET /movimientos-inventario/producto/:id_producto
  async getByProduct(productId) {
    const response = await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/producto/${productId}`)
    return extractArray(response);
  },

  // GET /movimientos-inventario/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.MOVEMENTS.BASE}/${id}`)
    return response.data;
  },

  // --- MÉTODOS DE ESCRITURA ---

  async create(movementData) {
    return await apiClient.post(ENDPOINTS.MOVEMENTS.BASE, movementData)
  },

  async createEntry(entryData) {
    return await apiClient.post(`${ENDPOINTS.MOVEMENTS.BASE}/entrada`, entryData)
  },

  async createExit(exitData) {
    return await apiClient.post(`${ENDPOINTS.MOVEMENTS.BASE}/salida`, exitData)
  },

  async createAdjustment(adjustmentData) {
    return await apiClient.post(`${ENDPOINTS.MOVEMENTS.BASE}/ajuste`, adjustmentData)
  },
}