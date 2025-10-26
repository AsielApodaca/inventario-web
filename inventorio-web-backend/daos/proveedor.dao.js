const { Proveedor } = require('../models');

class ProveedorDAO {
  async registrarProveedor(data) {
    try {
      return await Proveedor.create(data);
    } catch (error) {
      throw error;
    }
  }

  async listarProveedores() {
    try {
      return await Proveedor.findAll();
    } catch (error) {
      throw error;
    }
  }

  async buscarPorNombre(nombre) {
    try {
      return await Proveedor.findAll({ where: { nombre } });
    } catch (error) {
      throw error;
    }
  }

  async actualizarProveedor(id, data) {
    try {
      const proveedor = await Proveedor.findByPk(id);
      if (!proveedor) return null;
      return await proveedor.update(data);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProveedorDAO();
