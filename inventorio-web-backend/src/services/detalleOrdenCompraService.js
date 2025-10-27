const detalleOrdenCompraDAO = require('../daos/detalleOrdenCompraDAO');
const productoDAO = require('../daos/productoDAO'); 

class DetalleOrdenCompraService {
  async agregarDetalle(data) {
    if (!data.id_orden || isNaN(data.id_orden)) {
      throw new Error('ID de orden inválido');
    }

    if (!data.id_producto || isNaN(data.id_producto)) {
      throw new Error('ID de producto inválido');
    }

    if (!data.cantidad || data.cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (!data.precio_unitario || data.precio_unitario <= 0) {
      throw new Error('El precio unitario debe ser mayor a 0');
    }

  
    data.subtotal = data.cantidad * data.precio_unitario;

    return await detalleOrdenCompraDAO.agregarDetalle(data);
  }

  async consultarDetallesPorOrden(id_orden) {
    if (!id_orden || isNaN(id_orden)) {
      throw new Error('ID de orden inválido');
    }

    const detalles = await detalleOrdenCompraDAO.consultarDetallesPorOrden(id_orden);

    const totalOrden = detalles.reduce((sum, detalle) => sum + parseFloat(detalle.subtotal || 0), 0);

    return {
      detalles,
      resumen: {
        cantidad_items: detalles.length,
        total: totalOrden.toFixed(2)
      }
    };
  }

  async actualizarDetalle(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID de detalle inválido');
    }

    if (data.cantidad || data.precio_unitario) {
      const detalleActual = await detalleOrdenCompraDAO.actualizarDetalle(id, {});
      if (!detalleActual) {
        throw new Error('Detalle no encontrado');
      }

      const cantidad = data.cantidad || detalleActual.cantidad;
      const precio = data.precio_unitario || detalleActual.precio_unitario;

      if (cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      if (precio <= 0) {
        throw new Error('El precio unitario debe ser mayor a 0');
      }

      data.subtotal = cantidad * precio;
    }

    const detalle = await detalleOrdenCompraDAO.actualizarDetalle(id, data);
    if (!detalle) {
      throw new Error('Detalle no encontrado');
    }

    return detalle;
  }

  async eliminarDetalle(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de detalle inválido');
    }

 
  }
}

module.exports = new DetalleOrdenCompraService();