import db from '../models/index.js';
const { MovimientoInventario, Producto, Usuario, Almacen, Ubicacion } = db;

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
      return await MovimientoInventario.findAll({ 
        where: { id_producto }, 
        include: [
          { model: Producto, as: 'producto' },
          { model: Usuario, as: 'usuario' },
          { model: Almacen, as: 'almacen' },
          { model: Ubicacion, as: 'ubicacion' }
        ],
        order: [['fecha_movimiento', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  async consultarPorFecha(rango) {
    try {
      return await MovimientoInventario.findAll({ 
        where: { fecha_movimiento: rango },
        include: [
          { model: Producto, as: 'producto' },
          { model: Usuario, as: 'usuario' },
          { model: Almacen, as: 'almacen' },
          { model: Ubicacion, as: 'ubicacion' }
        ],
        order: [['fecha_movimiento', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  async obtenerTodos() {
    try {
      return await MovimientoInventario.findAll({
        include: [
          { model: Producto, as: 'producto' },
          { model: Usuario, as: 'usuario' },
          { model: Almacen, as: 'almacen' },
          { model: Ubicacion, as: 'ubicacion' }
        ],
        order: [['fecha_movimiento', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await MovimientoInventario.findByPk(id, {
        include: [
          { model: Producto, as: 'producto' },
          { model: Usuario, as: 'usuario' },
          { model: Almacen, as: 'almacen' },
          { model: Ubicacion, as: 'ubicacion' }
        ]
      });
    } catch (error) {
      throw error;
    }
  }

  async actualizarEstado(id, estado) {
    try {
      const movimiento = await MovimientoInventario.findByPk(id);
      if (!movimiento) return null;
      return await movimiento.update({ estado });
    } catch (error) {
      throw error;
    }
  }
}

export default new MovimientoInventarioDAO();
