
import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const AlmacenUbicacionService = {
  // GET /almacenes/:id_almacen/ubicaciones
  async getByAlmacen(idAlmacen, params = {}) {
    return await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${idAlmacen}/ubicaciones`, { params })
  },

  // GET /almacenes/:id_almacen/ubicaciones/buscar
  async searchByCode(idAlmacen, codigoParams) {
    return await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${idAlmacen}/ubicaciones/buscar`, { 
      params: codigoParams 
    })
  },

  // GET /almacenes/:id_almacen/ubicaciones/disponibles
  async getDisponibles(idAlmacen) {
    return await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${idAlmacen}/ubicaciones/disponibles`)
  },
}