import reportesDAO from '../daos/reportesDAO';
import inventarioDAO from '../daos/inventarioDAO';
import productoDAO from '../daos/productoDAO';
import movimientoInventarioDAO from '../daos/movimientoInventarioDAO';
import ordenCompraDAO from '../daos/ordenCompraDAO';
import {Op} from 'sequelize';

class ReportesService {
  async reporteStockTotal(opciones = {}) {
    const inventarios = await reportesDAO.reporteStockTotal();

    const porAlmacen = {};
    let stockTotal = 0;
    let valorTotal = 0;

    inventarios.forEach(inv => {
      const almacenId = inv.id_ubicacion; 
      stockTotal += inv.cantidad || 0;
      
      if (inv.producto) {
        valorTotal += (inv.cantidad || 0) * (inv.producto.precio_compra || 0);
      }

      if (!porAlmacen[almacenId]) {
        porAlmacen[almacenId] = {
          items: [],
          cantidad_total: 0,
          valor_total: 0
        };
      }

      porAlmacen[almacenId].items.push(inv);
      porAlmacen[almacenId].cantidad_total += inv.cantidad || 0;
      porAlmacen[almacenId].valor_total += (inv.cantidad || 0) * (inv.producto?.precio_compra || 0);
    });

    return {
      inventarios,
      resumen: {
        total_items: inventarios.length,
        stock_total: stockTotal,
        valor_total: valorTotal.toFixed(2),
        por_almacen: porAlmacen
      },
      generado_en: new Date()
    };
  }

  async productosConStockBajo(umbral) {
    let productos = await reportesDAO.productosConStockBajo();

    const productosConStock = await Promise.all(
      productos.map(async (producto) => {
        const stockInfo = await inventarioDAO.consultarStockPorProducto(producto.id);
        const stockActual = stockInfo.reduce((sum, inv) => sum + (inv.cantidad || 0), 0);
        
        return {
          ...producto.toJSON(),
          stock_actual: stockActual,
          stock_minimo: producto.stock_minimo || 0,
          diferencia: stockActual - (producto.stock_minimo || 0),
          estado: stockActual <= 0 ? 'sin_stock' : 
                  stockActual < (producto.stock_minimo || 0) ? 'stock_bajo' : 'normal'
        };
      })
    );

    const productosBajoStock = productosConStock.filter(p => 
      p.stock_actual < p.stock_minimo || (umbral && p.stock_actual < umbral)
    );

    productosBajoStock.sort((a, b) => a.stock_actual - b.stock_actual);

    return {
      productos: productosBajoStock,
      resumen: {
        total_productos_bajo_stock: productosBajoStock.length,
        sin_stock: productosBajoStock.filter(p => p.stock_actual === 0).length,
        stock_critico: productosBajoStock.filter(p => p.stock_actual > 0 && p.stock_actual < 5).length
      },
      generado_en: new Date()
    };
  }

  async movimientosDiarios(fecha) {
    if (!fecha) {
      fecha = new Date();
    }

    const fechaBusqueda = new Date(fecha);
    if (isNaN(fechaBusqueda.getTime())) {
      throw new Error('Formato de fecha inválido');
    }

    const movimientos = await reportesDAO.movimientosDiarios(fechaBusqueda);

    const analisis = {
      entradas: { cantidad: 0, items: [] },
      salidas: { cantidad: 0, items: [] },
      ajustes: { cantidad: 0, items: [] },
      otros: { cantidad: 0, items: [] }
    };

    movimientos.forEach(mov => {
      switch (mov.tipo_movimiento) {
        case 'entrada':
        case 'devolucion':
          analisis.entradas.cantidad += mov.cantidad || 0;
          analisis.entradas.items.push(mov);
          break;
        case 'salida':
          analisis.salidas.cantidad += mov.cantidad || 0;
          analisis.salidas.items.push(mov);
          break;
        case 'ajuste':
          analisis.ajustes.cantidad += mov.cantidad || 0;
          analisis.ajustes.items.push(mov);
          break;
        default:
          analisis.otros.cantidad += mov.cantidad || 0;
          analisis.otros.items.push(mov);
      }
    });

    return {
      fecha: fechaBusqueda,
      movimientos,
      analisis,
      resumen: {
        total_movimientos: movimientos.length,
        balance: analisis.entradas.cantidad - analisis.salidas.cantidad
      },
      generado_en: new Date()
    };
  }

  async movimientosPorPeriodo(fecha_inicio, fecha_fin) {
    if (!fecha_inicio || !fecha_fin) {
      throw new Error('Las fechas de inicio y fin son requeridas');
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new Error('Formato de fecha inválido');
    }

    if (inicio > fin) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha fin');
    }

    const dias = [];
    const currentDate = new Date(inicio);
    
    while (currentDate <= fin) {
      const movimientosDia = await this.movimientosDiarios(new Date(currentDate));
      dias.push({
        fecha: new Date(currentDate),
        ...movimientosDia
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totales = {
      entradas: dias.reduce((sum, dia) => sum + dia.analisis.entradas.cantidad, 0),
      salidas: dias.reduce((sum, dia) => sum + dia.analisis.salidas.cantidad, 0),
      ajustes: dias.reduce((sum, dia) => sum + dia.analisis.ajustes.cantidad, 0)
    };

    return {
      periodo: { inicio: fecha_inicio, fin: fecha_fin },
      dias,
      totales,
      balance_periodo: totales.entradas - totales.salidas,
      generado_en: new Date()
    };
  }

  async valorTotalInventario() {
    const valorTotal = await reportesDAO.valorTotalInventario();

    const productos = await productoDAO.listarProductos();
    const inventarios = await reportesDAO.reporteStockTotal();

    const desglose = {
      por_categoria: {},
      por_proveedor: {},
      productos_sin_precio: []
    };

    let valorCalculado = 0;

    for (const inv of inventarios) {
      if (inv.producto) {
        const producto = inv.producto;
        const valorProducto = (inv.cantidad || 0) * (producto.precio_compra || 0);
        valorCalculado += valorProducto;

        const categoriaId = producto.id_categoria || 'sin_categoria';
        if (!desglose.por_categoria[categoriaId]) {
          desglose.por_categoria[categoriaId] = {
            nombre: producto.categoria?.nombre || 'Sin categoría',
            valor: 0,
            items: 0
          };
        }
        desglose.por_categoria[categoriaId].valor += valorProducto;
        desglose.por_categoria[categoriaId].items++;

        const proveedorId = producto.id_proveedor || 'sin_proveedor';
        if (!desglose.por_proveedor[proveedorId]) {
          desglose.por_proveedor[proveedorId] = {
            nombre: producto.proveedor?.nombre || 'Sin proveedor',
            valor: 0,
            items: 0
          };
        }
        desglose.por_proveedor[proveedorId].valor += valorProducto;
        desglose.por_proveedor[proveedorId].items++;

        if (!producto.precio_compra || producto.precio_compra === 0) {
          desglose.productos_sin_precio.push({
            id: producto.id,
            nombre: producto.nombre,
            cantidad: inv.cantidad
          });
        }
      }
    }

    return {
      valor_total: valorCalculado.toFixed(2),
      desglose,
      alertas: {
        productos_sin_precio: desglose.productos_sin_precio.length
      },
      generado_en: new Date()
    };
  }

  async ordenesPendientes() {
    const ordenes = await reportesDAO.ordenesPendientes();

    const analisis = {
      total_ordenes: ordenes.length,
      monto_total: 0,
      por_proveedor: {},
      ordenes_vencidas: [],
      ordenes_proximas: []
    };

    const hoy = new Date();
    const tresDias = new Date();
    tresDias.setDate(hoy.getDate() + 3);

    ordenes.forEach(orden => {
      analisis.monto_total += parseFloat(orden.total || 0);

      const proveedorId = orden.id_proveedor;
      if (!analisis.por_proveedor[proveedorId]) {
        analisis.por_proveedor[proveedorId] = {
          nombre: orden.proveedor?.nombre || 'Desconocido',
          cantidad_ordenes: 0,
          monto: 0
        };
      }
      analisis.por_proveedor[proveedorId].cantidad_ordenes++;
      analisis.por_proveedor[proveedorId].monto += parseFloat(orden.total || 0);

      if (orden.fecha_entrega_esperada) {
        const fechaEntrega = new Date(orden.fecha_entrega_esperada);
        if (fechaEntrega < hoy) {
          analisis.ordenes_vencidas.push(orden);
        } else if (fechaEntrega <= tresDias) {
          analisis.ordenes_proximas.push(orden);
        }
      }
    });

    return {
      ordenes,
      analisis,
      alertas: {
        ordenes_vencidas: analisis.ordenes_vencidas.length,
        ordenes_proximas_vencer: analisis.ordenes_proximas.length
      },
      generado_en: new Date()
    };
  }

  async reporteCompleto(opciones = {}) {
    const [
      stockTotal,
      stockBajo,
      valorInventario,
      ordenesPendientes
    ] = await Promise.all([
      this.reporteStockTotal(),
      this.productosConStockBajo(),
      this.valorTotalInventario(),
      this.ordenesPendientes()
    ]);

    return {
      fecha_reporte: new Date(),
      stock: stockTotal.resumen,
      alertas_stock: stockBajo.resumen,
      valor_inventario: valorInventario.valor_total,
      ordenes: ordenesPendientes.analisis,
      recomendaciones: this._generarRecomendaciones({
        stockBajo,
        ordenesPendientes
      })
    };
  }

  _generarRecomendaciones(data) {
    const recomendaciones = [];

    if (data.stockBajo.resumen.sin_stock > 0) {
      recomendaciones.push({
        tipo: 'critico',
        mensaje: `Hay ${data.stockBajo.resumen.sin_stock} productos sin stock`
      });
    }

    if (data.stockBajo.resumen.total_productos_bajo_stock > 5) {
      recomendaciones.push({
        tipo: 'advertencia',
        mensaje: `${data.stockBajo.resumen.total_productos_bajo_stock} productos necesitan reabastecimiento`
      });
    }

    if (data.ordenesPendientes.alertas.ordenes_vencidas > 0) {
      recomendaciones.push({
        tipo: 'critico',
        mensaje: `${data.ordenesPendientes.alertas.ordenes_vencidas} órdenes de compra vencidas`
      });
    }

    return recomendaciones;
  }

  async exportarReporte(tipo, formato = 'json', opciones = {}) {
    let datos;

    switch (tipo) {
      case 'stock_total':
        datos = await this.reporteStockTotal(opciones);
        break;
      case 'stock_bajo':
        datos = await this.productosConStockBajo(opciones.umbral);
        break;
      case 'valor_inventario':
        datos = await this.valorTotalInventario();
        break;
      case 'ordenes_pendientes':
        datos = await this.ordenesPendientes();
        break;
      case 'completo':
        datos = await this.reporteCompleto(opciones);
        break;
      default:
        throw new Error('Tipo de reporte no válido');
    }

  
    return {
      formato,
      tipo,
      datos,
      generado_en: new Date()
    };
  }
}

export default new ReportesService();