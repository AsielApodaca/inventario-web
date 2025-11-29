import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

function extractArray(response) {
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export const WarehouseService = {
  // GET /almacenes
  async getAll() {
    try {
      const response = await apiClient.get(ENDPOINTS.WAREHOUSES.BASE)
      // Tu plantilla usaba .data directamente, aquí lo adaptamos para que devuelva un objeto
      // compatible con tu componente warehouses-mfe.js original que espera response.data
      const arrayData = extractArray(response);
      return { data: arrayData }; 
    } catch (error) {
      return { data: [] };
    }
  },

  // GET /almacenes/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`)
    return response.data;
  },

  // --- MÉTODO REQUERIDO POR TU MFE (Faltaba en la plantilla) ---
  // GET /ubicaciones/almacen/:id
  async getUbicaciones(idAlmacen) {
    try {
       // Nota: Usamos ENDPOINTS.LOCATIONS porque las ubicaciones suelen estar ahí
       const response = await apiClient.get(`${ENDPOINTS.LOCATIONS.BASE}/almacen/${idAlmacen}`)
       return { data: extractArray(response) };
    } catch (error) {
       return { data: [] };
    }
  },

  // --- MÉTODOS DE ESCRITURA ---

  async create(warehouseData) {
    return await apiClient.post(ENDPOINTS.WAREHOUSES.BASE, warehouseData)
  },

  async update(id, warehouseData) {
    return await apiClient.put(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`, warehouseData)
  },

  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`)
  },
}