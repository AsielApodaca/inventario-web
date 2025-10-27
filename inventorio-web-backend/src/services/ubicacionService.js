import ubicacionDAO from '../daos/ubicacionDAO';
import almacenDAO from '../daos/almacenDAO';
import inventarioDAO from '../daos/inventarioDAO';

class UbicacionService {
  async crearUbicacion(data) {
    if (!data.id_almacen || isNaN(data.id_almacen)) {
      throw new Error('ID de almacén inválido');
    }

    if (!data.codigo || data.codigo.trim() === '') {
      throw new Error('El código de ubicación es requerido');
    }

    if (!data.tipo || data.tipo.trim() === '') {
      throw new Error('El tipo de ubicación es requerido');
    }

    const tiposPermitidos = ['estanteria', 'pasillo', 'zona', 'rack', 'pallet', 'otro'];
    if (!tiposPermitidos.includes(data.tipo.toLowerCase())) {
      throw new Error(`Tipo de ubicación inválido. Tipos permitidos: ${tiposPermitidos.join(', ')}`);
    }

    const almacen = await almacenDAO.actualizarAlmacen(data.id_almacen, {});
    if (!almacen) {
      throw new Error('El almacén especificado no existe');
    }

    const ubicacionesExistentes = await ubicacionDAO.listarPorAlmacen(data.id_almacen);
    const codigoExiste = ubicacionesExistentes.some(u => 
      u.codigo.toLowerCase() === data.codigo.toLowerCase()
    );

    if (codigoExiste) {
      throw new Error('Ya existe una ubicación con ese código en este almacén');
    }

    if (data.capacidad && data.capacidad < 0) {
      throw new Error('La capacidad no puede ser negativa');
    }

    data.codigo = data.codigo.trim().toUpperCase();
    data.tipo = data.tipo.trim().toLowerCase();
    if (data.descripcion) data.descripcion = data.descripcion.trim();

    return await ubicacionDAO.crearUbicacion(data);
  }

  async listarPorAlmacen(id_almacen, opciones = {}) {
    if (!id_almacen || isNaN(id_almacen)) {
      throw new Error('ID de almacén inválido');
    }

    const almacen = await almacenDAO.actualizarAlmacen(id_almacen, {});
    if (!almacen) {
      throw new Error('El almacén especificado no existe');
    }

    let ubicaciones = await ubicacionDAO.listarPorAlmacen(id_almacen);

    if (opciones.tipo) {
      ubicaciones = ubicaciones.filter(u => u.tipo === opciones.tipo);
    }

    const ubicacionesConOcupacion = await Promise.all(
      ubicaciones.map(async (ubicacion) => {
        const productos = await inventarioDAO.consultarProductosPorUbicacion(ubicacion.id);
        
        const ocupacion = {
          productos_almacenados: productos.inventarios?.length || 0,
          cantidad_total: productos.resumen?.cantidad_total || 0,
          porcentaje_ocupacion: 0
        };

        if (ubicacion.capacidad && ubicacion.capacidad > 0) {
          ocupacion.porcentaje_ocupacion = 
            ((ocupacion.cantidad_total / ubicacion.capacidad) * 100).toFixed(2);
        }

        return {
          ...ubicacion.toJSON(),
          ocupacion
        };
      })
    );

    if (opciones.ordenar_por === 'codigo') {
      ubicacionesConOcupacion.sort((a, b) => a.codigo.localeCompare(b.codigo));
    } else if (opciones.ordenar_por === 'ocupacion') {
      ubicacionesConOcupacion.sort((a, b) => 
        b.ocupacion.porcentaje_ocupacion - a.ocupacion.porcentaje_ocupacion
      );
    }

    return {
      almacen: {
        id: almacen.id,
        nombre: almacen.nombre
      },
      ubicaciones: ubicacionesConOcupacion,
      resumen: {
        total_ubicaciones: ubicacionesConOcupacion.length,
        ubicaciones_vacias: ubicacionesConOcupacion.filter(u => u.ocupacion.productos_almacenados === 0).length,
        ubicaciones_llenas: ubicacionesConOcupacion.filter(u => 
          u.capacidad && u.ocupacion.cantidad_total >= u.capacidad
        ).length
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
      productos: productosInfo.inventarios,
      ocupacion: {
        productos_almacenados: productosInfo.inventarios.length,
        cantidad_total: productosInfo.resumen.cantidad_total,
        capacidad: ubicacion.capacidad,
        disponible: ubicacion.capacidad ? 
          ubicacion.capacidad - productosInfo.resumen.cantidad_total : null
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

    if (data.codigo && data.codigo.trim() === '') {
      throw new Error('El código de ubicación no puede estar vacío');
    }

    if (data.tipo) {
      const tiposPermitidos = ['estanteria', 'pasillo', 'zona', 'rack', 'pallet', 'otro'];
      if (!tiposPermitidos.includes(data.tipo.toLowerCase())) {
        throw new Error(`Tipo de ubicación inválido. Tipos permitidos: ${tiposPermitidos.join(', ')}`);
      }
    }

    if (data.codigo && data.codigo !== ubicacionActual.codigo) {
      const ubicacionesAlmacen = await ubicacionDAO.listarPorAlmacen(ubicacionActual.id_almacen);
      const codigoExiste = ubicacionesAlmacen.some(u => 
        u.id !== id && u.codigo.toLowerCase() === data.codigo.toLowerCase()
      );

      if (codigoExiste) {
        throw new Error('Ya existe una ubicación con ese código en este almacén');
      }
    }

    if (data.capacidad && data.capacidad < ubicacionActual.capacidad) {
      const productosInfo = await inventarioDAO.consultarProductosPorUbicacion(id);
      if (productosInfo.resumen.cantidad_total > data.capacidad) {
        throw new Error(
          `No se puede reducir la capacidad a ${data.capacidad}. ` +
          `Actualmente hay ${productosInfo.resumen.cantidad_total} unidades almacenadas`
        );
      }
    }

    if (data.codigo) data.codigo = data.codigo.trim().toUpperCase();
    if (data.tipo) data.tipo = data.tipo.trim().toLowerCase();
    if (data.descripcion) data.descripcion = data.descripcion.trim();

    return await ubicacionDAO.actualizarUbicacion(id, data);
  }

  async cambiarEstadoUbicacion(id, activo) {
    if (!id || isNaN(id)) {
      throw new Error('ID de ubicación inválido');
    }

    const ubicacion = await ubicacionDAO.actualizarUbicacion(id, {});
    if (!ubicacion) {
      throw new Error('Ubicación no encontrada');
    }

    if (!activo) {
      const productosInfo = await inventarioDAO.consultarProductosPorUbicacion(id);
      if (productosInfo.inventarios.length > 0) {
        throw new Error('No se puede desactivar una ubicación con productos almacenados');
      }
    }

    return await ubicacionDAO.actualizarUbicacion(id, { activo });
  }

  async buscarUbicacionPorCodigo(codigo, id_almacen) {
    if (!codigo || codigo.trim() === '') {
      throw new Error('El código de búsqueda es requerido');
    }

    if (!id_almacen || isNaN(id_almacen)) {
      throw new Error('ID de almacén inválido');
    }

    const ubicaciones = await ubicacionDAO.listarPorAlmacen(id_almacen);
    const ubicacion = ubicaciones.find(u => 
      u.codigo.toLowerCase() === codigo.trim().toLowerCase()
    );

    if (!ubicacion) {
      throw new Error('Ubicación no encontrada');
    }

    return await this.obtenerUbicacionPorId(ubicacion.id);
  }

  async obtenerUbicacionesDisponibles(id_almacen, cantidadRequerida = 1) {
    const { ubicaciones } = await this.listarPorAlmacen(id_almacen);

    const disponibles = ubicaciones.filter(u => {
      if (u.activo === false) return false;
      if (!u.capacidad) return true; 
      
      const disponible = u.capacidad - u.ocupacion.cantidad_total;
      return disponible >= cantidadRequerida;
    });

    return disponibles.sort((a, b) => {
      const espacioA = a.capacidad ? a.capacidad - a.ocupacion.cantidad_total : Infinity;
      const espacioB = b.capacidad ? b.capacidad - b.ocupacion.cantidad_total : Infinity;
      return espacioB - espacioA;
    });
  }
}

export default new UbicacionService();