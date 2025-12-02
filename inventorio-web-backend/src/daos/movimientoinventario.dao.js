import db from '../models/index.js';
const { MovimientoInventario, Producto, Usuario } = db;

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
          { model: Usuario, as: 'usuario' }
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
          { model: Usuario, as: 'usuario' }
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
          { model: Usuario, as: 'usuario' }
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
          { model: Usuario, as: 'usuario' }
        ]
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new MovimientoInventarioDAO();
