import ordenCompraDAO from '../daos/ordenCompraDAO';
import detalleOrdenCompraDAO from '../daos/detalleOrdenCompraDAO';
import proveedorDAO from '../daos/proveedorDAO';

class OrdenCompraService {
  ESTADOS = {
    PENDIENTE: 'pendiente',
    APROBADA: 'aprobada',
    ENVIADA: 'enviada',
    RECIBIDA: 'recibida',
    CANCELADA: 'cancelada'
  };

  async crearOrden(data, id_usuario) {
    if (!data.id_proveedor || isNaN(data.id_proveedor)) {
      throw new Error('ID de proveedor inválido');
    }

    const proveedor = await proveedorDAO.actualizarProveedor(data.id_proveedor, {});
    if (!proveedor) {
      throw new Error('El proveedor no existe');
    }

    if (data.fecha_entrega_esperada) {
      const fechaEntrega = new Date(data.fecha_entrega_esperada);
      const hoy = new Date();
      
      if (fechaEntrega < hoy) {
        throw new Error('La fecha de entrega esperada no puede ser anterior a hoy');
      }
    }

    data.estado = this.ESTADOS.PENDIENTE;
    data.fecha_orden = new Date();
    data.id_usuario_creador = id_usuario;
    data.total = data.total || 0;

    return await ordenCompraDAO.crearOrden(data);
  }

  async listarOrdenes(filtros = {}) {
    let ordenes = await ordenCompraDAO.listarOrdenes();

    if (filtros.estado) {
      ordenes = ordenes.filter(orden => orden.estado === filtros.estado);
    }

    if (filtros.id_proveedor) {
      ordenes = ordenes.filter(orden => orden.id_proveedor === parseInt(filtros.id_proveedor));
    }

    const resumen = {
      total_ordenes: ordenes.length,
      monto_total: ordenes.reduce((sum, orden) => sum + parseFloat(orden.total || 0), 0),
      por_estado: {}
    };

    Object.values(this.ESTADOS).forEach(estado => {
      const ordenesEstado = ordenes.filter(o => o.estado === estado);
      resumen.por_estado[estado] = {
        cantidad: ordenesEstado.length,
        monto: ordenesEstado.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
      };
    });

    return {
      ordenes,
      resumen
    };
  }

  async buscarPorProveedor(id_proveedor) {
    if (!id_proveedor || isNaN(id_proveedor)) {
      throw new Error('ID de proveedor inválido');
    }

    const ordenes = await ordenCompraDAO.buscarPorProveedor(id_proveedor);

    const estadisticas = {
      total_ordenes: ordenes.length,
      monto_total: ordenes.reduce((sum, o) => sum + parseFloat(o.total || 0), 0),
      ordenes_completadas: ordenes.filter(o => o.estado === this.ESTADOS.RECIBIDA).length,
      ordenes_pendientes: ordenes.filter(o => o.estado === this.ESTADOS.PENDIENTE).length
    };

    return {
      ordenes,
      estadisticas
    };
  }

  async filtrarPorEstado(estado) {
    if (!estado || !Object.values(this.ESTADOS).includes(estado)) {
      throw new Error(`Estado inválido. Estados permitidos: ${Object.values(this.ESTADOS).join(', ')}`);
    }

    return await ordenCompraDAO.filtrarPorEstado(estado);
  }

  async obtenerOrdenPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden inválido');
    }

    const orden = await ordenCompraDAO.actualizarEstado(id, '');
    if (!orden) {
      throw new Error('Orden no encontrada');
    }

    const detallesInfo = await detalleOrdenCompraDAO.consultarDetallesPorOrden(id);

    return {
      orden,
      detalles: detallesInfo.detalles,
      resumen: detallesInfo.resumen
    };
  }

  async actualizarEstado(id, nuevoEstado, id_usuario) {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden inválido');
    }

    if (!nuevoEstado || !Object.values(this.ESTADOS).includes(nuevoEstado)) {
      throw new Error(`Estado inválido. Estados permitidos: ${Object.values(this.ESTADOS).join(', ')}`);
    }

    const ordenActual = await ordenCompraDAO.actualizarEstado(id, '');
    if (!ordenActual) {
      throw new Error('Orden no encontrada');
    }

    const transicionesValidas = {
      [this.ESTADOS.PENDIENTE]: [this.ESTADOS.APROBADA, this.ESTADOS.CANCELADA],
      [this.ESTADOS.APROBADA]: [this.ESTADOS.ENVIADA, this.ESTADOS.CANCELADA],
      [this.ESTADOS.ENVIADA]: [this.ESTADOS.RECIBIDA, this.ESTADOS.CANCELADA],
      [this.ESTADOS.RECIBIDA]: [],
      [this.ESTADOS.CANCELADA]: []
    };

    const estadoActual = ordenActual.estado;
    if (!transicionesValidas[estadoActual].includes(nuevoEstado)) {
      throw new Error(`No se puede cambiar de ${estadoActual} a ${nuevoEstado}`);
    }

    const orden = await ordenCompraDAO.actualizarEstado(id, nuevoEstado);

  
    if (nuevoEstado === this.ESTADOS.RECIBIDA) {
    }

    return orden;
  }

  async calcularTotalOrden(id_orden) {
    const detallesInfo = await detalleOrdenCompraDAO.consultarDetallesPorOrden(id_orden);
    return detallesInfo.resumen.total;
  }

  async cancelarOrden(id, motivo, id_usuario) {
    if (!motivo || motivo.trim() === '') {
      throw new Error('El motivo de cancelación es requerido');
    }

    return await this.actualizarEstado(id, this.ESTADOS.CANCELADA, id_usuario);
  }
}

export default new OrdenCompraService();