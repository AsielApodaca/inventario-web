const almacenDAO = require('../daos/almacen.dao');

class AlmacenService {
  async crearAlmacen(data) {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre del almacén es requerido');
    }

    if (!data.direccion || data.direccion.trim() === '') {
      throw new Error('La dirección del almacén es requerida');
    }

    data.nombre = data.nombre.trim();
    data.direccion = data.direccion.trim();

    return await almacenDAO.crearAlmacen(data);
  }

  async listarAlmacenes() {
    const almacenes = await almacenDAO.listarAlmacenes();

    return almacenes.map(almacen => ({
      id: almacen.id,
      nombre: almacen.nombre,
      direccion: almacen.direccion,
      activo: almacen.activo ?? true
    }));
  }

  async actualizarAlmacen(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID de almacén inválido');
    }

    if (data.nombre && data.nombre.trim() === '') {
      throw new Error('El nombre del almacén no puede estar vacío');
    }

    if (data.nombre) data.nombre = data.nombre.trim();
    if (data.direccion) data.direccion = data.direccion.trim();

    const almacen = await almacenDAO.actualizarAlmacen(id, data);
    if (!almacen) {
      throw new Error('Almacén no encontrado');
    }

    return almacen;
  }
}

module.exports = new AlmacenService();
