import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const DetalleOrdenCompraService = {
  // GET /ordenes-compra/:id_orden/detalles
  async getByOrden(idOrden) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles`)
  },

  // GET /ordenes-compra/:id_orden/detalles/:id
  async getById(idOrden, idDetalle) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles/${idDetalle}`)
  },

  // GET /ordenes-compra/:id_orden/detalles/producto/:id_producto
  async getByProducto(idOrden, idProducto) {
    return await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles/producto/${idProducto}`)
  },

  // POST /ordenes-compra/:id_orden/detalles (Admin)
  async create(idOrden, detalleData) {
    return await apiClient.post(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles`, detalleData)
  },

  // POST /ordenes-compra/:id_orden/detalles/multiples (Admin)
  async createMultiple(idOrden, detallesArray) {
    // El backend espera un objeto { detalles: [...] }
    return await apiClient.post(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles/multiples`, {
      detalles: detallesArray,
    })
  },

  // PUT /ordenes-compra/:id_orden/detalles/:id (Admin)
  async update(idOrden, idDetalle, detalleData) {
    return await apiClient.put(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles/${idDetalle}`, detalleData)
  },

  // PATCH /ordenes-compra/:id_orden/detalles/:id/cantidad (Admin)
  async updateCantidad(idOrden, idDetalle, cantidadData) {
    return await apiClient.patch(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles/${idDetalle}/cantidad`, cantidadData)
  },

  // PATCH /ordenes-compra/:id_orden/detalles/:id/precio (Admin)
  async updatePrecio(idOrden, idDetalle, precioData) {
    return await apiClient.patch(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles/${idDetalle}/precio`, precioData)
  },

  // DELETE /ordenes-compra/:id_orden/detalles/:id (Admin)
  async delete(idOrden, idDetalle) {
    return await apiClient.delete(`${ENDPOINTS.ORDERS.BASE}/${idOrden}/detalles/${idDetalle}`)
  },
}