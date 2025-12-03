import db from '../models/index.js';
const { Inventario, Producto, Ubicacion } = db;

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

  async buscarPorProductoYUbicacion(id_producto, id_ubicacion) {
    try {
      return await Inventario.findOne({ 
        where: { id_producto, id_ubicacion } 
      });
    } catch (error) {
      throw error;
    }
  }

  async incrementarCantidad(id, cantidad) {
    try {
      const inventario = await Inventario.findByPk(id);
      if (!inventario) return null;
      const nuevaCantidad = (inventario.cantidad || 0) + cantidad;
      return await inventario.update({ cantidad: nuevaCantidad });
    } catch (error) {
      throw error;
    }
  }
}

export default new InventarioDAO();
