import {Inventario, Producto, Ubicacion} from '../models';

class InventarioDAO {
  async registrarProductoEnUbicacion(data) {
    try {
      return await Inventario.create(data);
    } catch (error) {
      throw error;
    }
  }

  async consultarStockPorProducto(id_producto) {
    try {
      return await Inventario.findAll({ where: { id_producto }, include: ['ubicacion'] });
    } catch (error) {
      throw error;
    }
  }

  async consultarProductosPorUbicacion(id_ubicacion) {
    try {
      return await Inventario.findAll({ where: { id_ubicacion }, include: ['producto'] });
    } catch (error) {
      throw error;
    }
  }

  async actualizarCantidad(id, cantidad) {
    try {
      const inventario = await Inventario.findByPk(id);
      if (!inventario) return null;
      return await inventario.update({ cantidad });
    } catch (error) {
      throw error;
    }
  }
}

export default new InventarioDAO();
