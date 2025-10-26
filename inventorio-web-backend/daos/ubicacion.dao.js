const { Ubicacion } = require('../models');

class UbicacionDAO {
  async crearUbicacion(data) {
    try {
      return await Ubicacion.create(data);
    } catch (error) {
      throw error;
    }
  }

  async listarPorAlmacen(id_almacen) {
    try {
      return await Ubicacion.findAll({ where: { id_almacen } });
    } catch (error) {
      throw error;
    }
  }

  async actualizarUbicacion(id, data) {
    try {
      const ubicacion = await Ubicacion.findByPk(id);
      if (!ubicacion) return null;
      return await ubicacion.update(data);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UbicacionDAO();
