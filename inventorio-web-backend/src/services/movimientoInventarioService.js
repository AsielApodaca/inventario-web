import movimientoInventarioDAO from '../daos/movimientoinventario.dao.js';
import inventarioDAO from '../daos/inventario.dao.js';
import almacenDAO from '../daos/almacen.dao.js';
import ubicacionDAO from '../daos/ubicacion.dao.js';
import {Op} from 'sequelize';

class MovimientoInventarioService {
  TIPOS_MOVIMIENTO = {
    ENTRADA: 'entrada',
    SALIDA: 'salida',
    AJUSTE: 'ajuste',
    DEVOLUCION: 'devolucion',
    TRANSFERENCIA: 'transferencia'
  };

  ESTADOS = {
    PENDIENTE: 'pendiente',
    PROCESADO: 'procesado',
    CANCELADO: 'cancelado'
  };

  async registrarMovimiento(data, id_usuario) {
    if (!data.id_producto || isNaN(data.id_producto)) {
      throw new Error('ID de producto inválido');
    }

    if (!data.tipo_movimiento || !Object.values(this.TIPOS_MOVIMIENTO).includes(data.tipo_movimiento)) {
      throw new Error(`Tipo de movimiento inválido. Tipos permitidos: ${Object.values(this.TIPOS_MOVIMIENTO).join(', ')}`);
    }

    if (!data.cantidad || data.cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (!data.motivo || data.motivo.trim() === '') {
      throw new Error('El motivo del movimiento es requerido');
    }

    data.id_usuario = id_usuario;
    data.fecha_movimiento = new Date();
    data.motivo = data.motivo.trim();
    data.estado = this.ESTADOS.PENDIENTE;

    if (data.tipo_movimiento === this.TIPOS_MOVIMIENTO.SALIDA) {
      const stockInfo = await inventarioDAO.consultarStockPorProducto(data.id_producto);
      const stockTotal = stockInfo.reduce((sum, inv) => sum + (inv.cantidad || 0), 0);

      if (stockTotal < data.cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${stockTotal}, Requerido: ${data.cantidad}`);
      }
    }

    return await movimientoInventarioDAO.registrarMovimiento(data);
  }

  async procesarMovimiento(id_movimiento, id_ubicacion) {
    // Validar que el movimiento existe
    const movimiento = await movimientoInventarioDAO.obtenerPorId(id_movimiento);
    if (!movimiento) {
      throw new Error('Movimiento no encontrado');
    }

    // Validar que el movimiento esté en estado pendiente
    if (movimiento.estado !== this.ESTADOS.PENDIENTE) {
      throw new Error(`El movimiento no puede ser procesado. Estado actual: ${movimiento.estado}`);
    }

    // Validar que se proporcione una ubicación
    if (!id_ubicacion || isNaN(id_ubicacion)) {
      throw new Error('ID de ubicación inválido');
    }

    // Validar que la ubicación existe
    const ubicacion = await ubicacionDAO.obtenerPorId(id_ubicacion);
    if (!ubicacion) {
      throw new Error('La ubicación no existe');
    }

    // Validar que el almacén existe (si está en el movimiento)
    let id_almacen = movimiento.id_almacen;
    if (!id_almacen) {
      // Si no tiene almacén, usar el de la ubicación
      id_almacen = ubicacion.id_almacen;
    }

    if (!id_almacen) {
      throw new Error('El movimiento debe tener un almacén asociado');
    }

    const almacen = await almacenDAO.obtenerPorId(id_almacen);
    if (!almacen) {
      throw new Error('El almacén no existe');
    }

    // Validar que la ubicación pertenece al almacén
    if (ubicacion.id_almacen !== id_almacen) {
      throw new Error('La ubicación no pertenece al almacén especificado');
    }

    // Procesar el movimiento según su tipo
    let inventarioActualizado = null;

    if (movimiento.tipo_movimiento === this.TIPOS_MOVIMIENTO.ENTRADA || 
        movimiento.tipo_movimiento === this.TIPOS_MOVIMIENTO.DEVOLUCION) {
      // Para entradas y devoluciones, incrementar el inventario
      const inventarioExistente = await inventarioDAO.buscarPorProductoYUbicacion(
        movimiento.id_producto, 
        id_ubicacion
      );

      if (inventarioExistente) {
        // Si ya existe, incrementar la cantidad
        inventarioActualizado = await inventarioDAO.incrementarCantidad(
          inventarioExistente.id, 
          movimiento.cantidad
        );
      } else {
        // Si no existe, crear nuevo registro directamente con el DAO
        inventarioActualizado = await inventarioDAO.registrarProductoEnUbicacion({
          id_producto: movimiento.id_producto,
          id_ubicacion: id_ubicacion,
          cantidad: movimiento.cantidad
        });
      }
    } else if (movimiento.tipo_movimiento === this.TIPOS_MOVIMIENTO.SALIDA) {
      // Para salidas, decrementar el inventario
      const inventarioExistente = await inventarioDAO.buscarPorProductoYUbicacion(
        movimiento.id_producto, 
        id_ubicacion
      );

      if (!inventarioExistente) {
        throw new Error('No hay inventario disponible en esta ubicación para este producto');
      }

      const cantidadDisponible = inventarioExistente.cantidad || 0;
      if (cantidadDisponible < movimiento.cantidad) {
        throw new Error(`Stock insuficiente en la ubicación. Disponible: ${cantidadDisponible}, Requerido: ${movimiento.cantidad}`);
      }

      const nuevaCantidad = cantidadDisponible - movimiento.cantidad;
      inventarioActualizado = await inventarioDAO.actualizarCantidad(
        inventarioExistente.id, 
        nuevaCantidad
      );
    } else if (movimiento.tipo_movimiento === this.TIPOS_MOVIMIENTO.AJUSTE) {
      // Para ajustes, actualizar directamente
      const inventarioExistente = await inventarioDAO.buscarPorProductoYUbicacion(
        movimiento.id_producto, 
        id_ubicacion
      );

      if (!inventarioExistente) {
        throw new Error('No existe inventario en esta ubicación para ajustar');
      }

      const nuevaCantidad = movimiento.cantidad;
      if (nuevaCantidad < 0) {
        throw new Error('La cantidad del ajuste no puede ser negativa');
      }

      inventarioActualizado = await inventarioDAO.actualizarCantidad(
        inventarioExistente.id, 
        nuevaCantidad
      );
    }

    // Actualizar el movimiento con la ubicación y cambiar su estado a procesado
    await movimientoInventarioDAO.actualizarEstado(id_movimiento, this.ESTADOS.PROCESADO);
    
    // Actualizar también id_almacen e id_ubicacion en el movimiento
    const movimientoActualizado = await movimientoInventarioDAO.obtenerPorId(id_movimiento);
    await movimientoActualizado.update({
      id_almacen: id_almacen,
      id_ubicacion: id_ubicacion
    });

    return {
      movimiento: movimientoActualizado,
      inventario: inventarioActualizado
    };
  }

  async consultarPorProducto(id_producto, opciones = {}) {
    if (!id_producto || isNaN(id_producto)) {
      throw new Error('ID de producto inválido');
    }

    const movimientos = await movimientoInventarioDAO.consultarPorProducto(id_producto);

    let movimientosFiltrados = movimientos;
    if (opciones.tipo_movimiento) {
      movimientosFiltrados = movimientos.filter(m => m.tipo_movimiento === opciones.tipo_movimiento);
    }

    const resumen = {
      total_entradas: 0,
      total_salidas: 0,
      total_ajustes: 0,
      cantidad_movimientos: movimientosFiltrados.length
    };

    movimientosFiltrados.forEach(mov => {
      switch (mov.tipo_movimiento) {
        case this.TIPOS_MOVIMIENTO.ENTRADA:
        case this.TIPOS_MOVIMIENTO.DEVOLUCION:
          resumen.total_entradas += mov.cantidad;
          break;
        case this.TIPOS_MOVIMIENTO.SALIDA:
          resumen.total_salidas += mov.cantidad;
          break;
        case this.TIPOS_MOVIMIENTO.AJUSTE:
          resumen.total_ajustes += mov.cantidad;
          break;
      }
    });

    resumen.saldo = resumen.total_entradas - resumen.total_salidas + resumen.total_ajustes;

    return {
      movimientos: movimientosFiltrados,
      resumen
    };
  }

  async consultarPorFecha(fecha_inicio, fecha_fin) {
    if (!fecha_inicio || !fecha_fin) {
      throw new Error('Las fechas de inicio y fin son requeridas');
    }

    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new Error('Formato de fecha inválido');
    }

    if (fechaInicio > fechaFin) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha fin');
    }

    // Ajustar fechaInicio al inicio del día (00:00:00)
    fechaInicio.setHours(0, 0, 0, 0);
    
    // Ajustar fechaFin al final del día (23:59:59)
    fechaFin.setHours(23, 59, 59, 999);

    const rango = {
      [Op.between]: [fechaInicio, fechaFin]
    };

    const movimientos = await movimientoInventarioDAO.consultarPorFecha(rango);

    const porTipo = {};
    Object.values(this.TIPOS_MOVIMIENTO).forEach(tipo => {
      porTipo[tipo] = {
        cantidad: 0,
        movimientos: []
      };
    });

    movimientos.forEach(mov => {
      if (porTipo[mov.tipo_movimiento]) {
        porTipo[mov.tipo_movimiento].cantidad += mov.cantidad;
        porTipo[mov.tipo_movimiento].movimientos.push(mov);
      }
    });

    return {
      movimientos,
      resumen: {
        total_movimientos: movimientos.length,
        periodo: {
          inicio: fecha_inicio,
          fin: fecha_fin
        },
        por_tipo: porTipo
      }
    };
  }

  async generarReporteMovimientos(filtros = {}) {
    let movimientos = [];

    if (filtros.id_producto) {
      const resultado = await this.consultarPorProducto(filtros.id_producto);
      movimientos = resultado.movimientos;
    } else if (filtros.fecha_inicio && filtros.fecha_fin) {
      const resultado = await this.consultarPorFecha(filtros.fecha_inicio, filtros.fecha_fin);
      movimientos = resultado.movimientos;
    } else {
      throw new Error('Debe especificar filtros (id_producto o rango de fechas)');
    }

    return {
      movimientos,
      generado_en: new Date(),
      filtros_aplicados: filtros
    };
  }
}

export default new MovimientoInventarioService();