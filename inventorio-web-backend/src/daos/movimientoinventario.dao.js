import {MovimientoInventario, Producto, Usuario} from '../models';

class MovimientoInventarioDAO {
  async registrarMovimiento(data) {
    try {
      return await MovimientoInventario.create(data);
    } catch (error) {
      throw error;
    }
  }

  async consultarPorProducto(id_producto) {
    try {
      return await MovimientoInventario.findAll({ where: { id_producto }, include: ['producto', 'usuario'] });
    } catch (error) {
      throw error;
    }
  }

  async consultarPorFecha(rango) {
    try {
      return await MovimientoInventario.findAll({ where: { fecha_movimiento: rango } });
    } catch (error) {
      throw error;
    }
  }
}

export default new MovimientoInventarioDAO();
