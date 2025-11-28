import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const AlmacenUbicacionService = {
  // GET /almacenes/:id_almacen/ubicaciones
  async getByAlmacen(idAlmacen, params = {}) {
    return await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${idAlmacen}/ubicaciones`, { params })
  },
}