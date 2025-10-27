import inventarioDAO from '../daos/inventarioDAO';

class InventarioService {
  async registrarProductoEnUbicacion(data) {
    if (!data.id_producto || isNaN(data.id_producto)) {
      throw new Error('ID de producto inválido');
    }

    if (!data.id_ubicacion || isNaN(data.id_ubicacion)) {
      throw new Error('ID de ubicación inválido');
    }

    if (data.cantidad === undefined || data.cantidad < 0) {
      throw new Error('La cantidad debe ser mayor o igual a 0');
    }

    const inventarioExistente = await inventarioDAO.consultarProductosPorUbicacion(data.id_ubicacion);
    const yaExiste = inventarioExistente.find(inv => inv.id_producto === data.id_producto);

    if (yaExiste) {
      throw new Error('El producto ya está registrado en esta ubicación');
    }

    return await inventarioDAO.registrarProductoEnUbicacion(data);
  }

  async consultarStockPorProducto(id_producto) {
    if (!id_producto || isNaN(id_producto)) {
      throw new Error('ID de producto inválido');
    }

    const inventarios = await inventarioDAO.consultarStockPorProducto(id_producto);

    const stockTotal = inventarios.reduce((sum, inv) => sum + (inv.cantidad || 0), 0);

    return {
      inventarios,
      resumen: {
        stock_total: stockTotal,
        ubicaciones: inventarios.length,
        stock_disponible: inventarios.filter(inv => inv.cantidad > 0).length
      }
    };
  }

  async consultarProductosPorUbicacion(id_ubicacion) {
    if (!id_ubicacion || isNaN(id_ubicacion)) {
      throw new Error('ID de ubicación inválido');
    }

    const inventarios = await inventarioDAO.consultarProductosPorUbicacion(id_ubicacion);

    const cantidadTotal = inventarios.reduce((sum, inv) => sum + (inv.cantidad || 0), 0);

    return {
      inventarios,
      resumen: {
        total_productos: inventarios.length,
        cantidad_total: cantidadTotal
      }
    };
  }

  async actualizarCantidad(id, cantidad) {
    if (!id || isNaN(id)) {
      throw new Error('ID de inventario inválido');
    }

    if (cantidad === undefined || cantidad < 0) {
      throw new Error('La cantidad debe ser mayor o igual a 0');
    }

    const inventario = await inventarioDAO.actualizarCantidad(id, cantidad);
    if (!inventario) {
      throw new Error('Registro de inventario no encontrado');
    }

    return inventario;
  }

  async ajustarInventario(id, ajuste, motivo) {
    if (!id || isNaN(id)) {
      throw new Error('ID de inventario inválido');
    }

    if (!ajuste || ajuste === 0) {
      throw new Error('El ajuste debe ser diferente de 0');
    }

    if (!motivo || motivo.trim() === '') {
      throw new Error('El motivo del ajuste es requerido');
    }

    const inventarioActual = await inventarioDAO.actualizarCantidad(id, 0); 
    if (!inventarioActual) {
      throw new Error('Registro de inventario no encontrado');
    }

    const nuevaCantidad = inventarioActual.cantidad + ajuste;

    if (nuevaCantidad < 0) {
      throw new Error('El ajuste resultaría en cantidad negativa');
    }

    return await inventarioDAO.actualizarCantidad(id, nuevaCantidad);
  }

  async verificarDisponibilidad(id_producto, cantidadRequerida) {
    const { resumen } = await this.consultarStockPorProducto(id_producto);

    return {
      disponible: resumen.stock_total >= cantidadRequerida,
      stock_actual: resumen.stock_total,
      cantidad_requerida: cantidadRequerida,
      diferencia: resumen.stock_total - cantidadRequerida
    };
  }
}

export default new InventarioService();