import {Almacen} from '../models';

class AlmacenDAO {
  async crearAlmacen(data) {
    try {
      return await Almacen.create(data);
    } catch (error) {
      throw error;
    }
  }

  async listarAlmacenes() {
    try {
      return await Almacen.findAll();
    } catch (error) {
      throw error;
    }
  }

  async actualizarAlmacen(id, data) {
    try {
      const almacen = await Almacen.findByPk(id);
      if (!almacen) return null;
      return await almacen.update(data);
    } catch (error) {
      throw error;
    }
  }
}

export default new AlmacenDAO();
