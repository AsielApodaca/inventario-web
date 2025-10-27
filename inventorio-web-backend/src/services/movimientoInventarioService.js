import movimientoInventarioDAO from '../daos/movimientoInventarioDAO';
import inventarioDAO from '../daos/inventarioDAO';
import {Op} from 'sequelize';

class MovimientoInventarioService {
  TIPOS_MOVIMIENTO = {
    ENTRADA: 'entrada',
    SALIDA: 'salida',
    AJUSTE: 'ajuste',
    DEVOLUCION: 'devolucion',
    TRANSFERENCIA: 'transferencia'
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

    if (data.tipo_movimiento === this.TIPOS_MOVIMIENTO.SALIDA) {
      const stockInfo = await inventarioDAO.consultarStockPorProducto(data.id_producto);
      const stockTotal = stockInfo.reduce((sum, inv) => sum + (inv.cantidad || 0), 0);

      if (stockTotal < data.cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${stockTotal}, Requerido: ${data.cantidad}`);
      }
    }

    return await movimientoInventarioDAO.registrarMovimiento(data);
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

  async consultarPorFecha(fecha_inicio, fecha_fin, opciones = {}) {
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