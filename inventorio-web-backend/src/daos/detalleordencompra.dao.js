import {Detalle_Orden_Compra, Producto} from '../models';

class DetalleOrdenCompraDAO {
  async agregarDetalle(data) {
    try {
      return await Detalle_Orden_Compra.create(data);
    } catch (error) {
      throw error;
    }
  }

  async consultarDetallesPorOrden(id_orden) {
    try {
      return await Detalle_Orden_Compra.findAll({ where: { id_orden }, include: ['producto'] });
    } catch (error) {
      throw error;
    }
  }

  async actualizarDetalle(id, data) {
    try {
      const detalle = await Detalle_Orden_Compra.findByPk(id);
      if (!detalle) return null;
      return await detalle.update(data);
    } catch (error) {
      throw error;
    }
  }
}

export default new DetalleOrdenCompraDAO();
