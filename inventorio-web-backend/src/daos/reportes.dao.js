const { Inventario, MovimientoInventario, Producto } = require('../models');
const Orden_Compra = require('../daos/ordencompra.dao');
const { Op } = require('sequelize');

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
      return await Orden_Compra.filtrarPorEstado('pendiente');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReportesDAO();
