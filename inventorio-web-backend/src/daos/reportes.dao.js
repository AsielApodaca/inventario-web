import {Op} from 'sequelize';
import db from '../models/index.js';
const { Inventario, MovimientoInventario, Producto, Orden_Compra } = db;

class ReportesDAO {
  async reporteStockTotal() {
    try {
      return await Inventario.findAll({ include: ['producto'] });
    } catch (error) {
      throw error;
    }
  }

  async productosConStockBajo() {
    try {
      return await Producto.findAll({ where: { stock_minimo: { [Op.gt]: 0 } } });
    } catch (error) {
      throw error;
    }
  }

  async movimientosDiarios(fecha) {
    try {
      return await MovimientoInventario.findAll({ where: { fecha_movimiento: fecha } });
    } catch (error) {
      throw error;
    }
  }

  async valorTotalInventario() {
    try {
      const productos = await Producto.findAll();
      return productos.reduce((total, p) => total + (p.precio_compra * (p.stock_maximo || 0)), 0);
    } catch (error) {
      throw error;
    }
  }

  async ordenesPendientes() {
    try {
      return await Orden_Compra.findAll({ 
        where: { estado: 'pendiente' },
        include: ['proveedor']
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new ReportesDAO();
