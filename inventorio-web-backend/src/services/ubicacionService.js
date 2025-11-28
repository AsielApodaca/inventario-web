import ubicacionDAO from '../daos/ubicacion.dao.js';
import almacenDAO from '../daos/almacen.dao.js';
import inventarioDAO from '../daos/inventario.dao.js';

class UbicacionService {
  async crearUbicacion(data) {
    if (!data.id_almacen || isNaN(data.id_almacen)) {
      throw new Error('ID de almacén inválido');
    }

    if (!data.pasillo || data.pasillo.trim() === '') {
      throw new Error('El pasillo es requerido');
    }

    const almacen = await almacenDAO.actualizarAlmacen(data.id_almacen, {});
    if (!almacen) {
      throw new Error('El almacén especificado no existe');
    }

    data.pasillo = data.pasillo.trim();
    if (data.estante) data.estante = data.estante.trim();
    if (data.nivel) data.nivel = data.nivel.trim();

    return await ubicacionDAO.crearUbicacion(data);
  }

  async listarPorAlmacen(id_almacen) {
    if (!id_almacen || isNaN(id_almacen)) {
      throw new Error('ID de almacén inválido');
    }

    const almacen = await almacenDAO.actualizarAlmacen(id_almacen, {});
    if (!almacen) {
      throw new Error('El almacén especificado no existe');
    }

    const ubicaciones = await ubicacionDAO.listarPorAlmacen(id_almacen);

    return {
      almacen: {
        id: almacen.id,
        nombre: almacen.nombre
      },
      ubicaciones,
      resumen: {
        total_ubicaciones: ubicaciones.length
      }
    };
  }

  async obtenerUbicacionPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de ubicación inválido');
    }

    const ubicacion = await ubicacionDAO.actualizarUbicacion(id, {});
    if (!ubicacion) {
      throw new Error('Ubicación no encontrada');
    }

    const productosInfo = await inventarioDAO.consultarProductosPorUbicacion(id);

    return {
      ubicacion,
      productos: productosInfo.inventarios || productosInfo,
      resumen: {
        productos_almacenados: (productosInfo.inventarios || productosInfo).length,
        cantidad_total: productosInfo.resumen?.cantidad_total || 0
      }
    };
  }

  async actualizarUbicacion(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID de ubicación inválido');
    }

    const ubicacionActual = await ubicacionDAO.actualizarUbicacion(id, {});
    if (!ubicacionActual) {
      throw new Error('Ubicación no encontrada');
    }

    if (data.pasillo) data.pasillo = data.pasillo.trim();
    if (data.estante) data.estante = data.estante.trim();
    if (data.nivel) data.nivel = data.nivel.trim();

    return await ubicacionDAO.actualizarUbicacion(id, data);
  }
}

export default new UbicacionService();