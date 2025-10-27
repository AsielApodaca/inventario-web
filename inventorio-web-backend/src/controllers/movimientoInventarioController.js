import MovimientoInventarioService from '../services/movimientoInventarioService.js';

export const movimientoInventarioController = {
  // POST /api/movimientos-inventario
  createMovimiento: async (req, res, next) => {
    try {
      const movimientoData = req.body;
      const idUsuario = req.user?.id || null;
      
      const nuevoMovimiento = await MovimientoInventarioService.registrarMovimiento(movimientoData, idUsuario);
      
      res.status(201).json({
        status: 'success',
        message: 'Movimiento de inventario registrado exitosamente',
        data: nuevoMovimiento
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('Tipo de movimiento inválido') ||
          error.message.includes('debe ser mayor a 0') || error.message.includes('requerido') ||
          error.message.includes('Stock insuficiente')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/movimientos-inventario/producto/:id_producto
  getMovimientosByProducto: async (req, res, next) => {
    try {
      const { id_producto } = req.params;
      const { tipo_movimiento } = req.query;
      
      const opciones = {};
      if (tipo_movimiento) opciones.tipo_movimiento = tipo_movimiento;
      
      const resultado = await MovimientoInventarioService.consultarPorProducto(
        parseInt(id_producto), 
        opciones
      );
      
      res.status(200).json({
        status: 'success',
        data: resultado.movimientos,
        metadata: {
          resumen: resultado.resumen
        },
        count: resultado.movimientos.length
      });
    } catch (error) {
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/movimientos-inventario/fecha
  getMovimientosByFecha: async (req, res, next) => {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          status: 'error',
          message: 'Los parámetros "fecha_inicio" y "fecha_fin" son requeridos'
        });
      }

      const resultado = await MovimientoInventarioService.consultarPorFecha(fecha_inicio, fecha_fin);
      
      res.status(200).json({
        status: 'success',
        data: resultado.movimientos,
        metadata: {
          resumen: resultado.resumen
        },
        count: resultado.movimientos.length
      });
    } catch (error) {
      if (error.message.includes('requeridas') || error.message.includes('Formato de fecha inválido') ||
          error.message.includes('no puede ser mayor')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/movimientos-inventario/reporte
  getReporteMovimientos: async (req, res, next) => {
    try {
      const { id_producto, fecha_inicio, fecha_fin } = req.query;
      
      const filtros = {};
      if (id_producto) filtros.id_producto = parseInt(id_producto);
      if (fecha_inicio) filtros.fecha_inicio = fecha_inicio;
      if (fecha_fin) filtros.fecha_fin = fecha_fin;
      
      const reporte = await MovimientoInventarioService.generarReporteMovimientos(filtros);
      
      res.status(200).json({
        status: 'success',
        data: reporte.movimientos,
        metadata: {
          generado_en: reporte.generado_en,
          filtros_aplicados: reporte.filtros_aplicados
        },
        count: reporte.movimientos.length
      });
    } catch (error) {
      if (error.message.includes('Debe especificar filtros')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/movimientos-inventario/tipos
  getTiposMovimiento: async (req, res, next) => {
    try {
      const tipos = Object.values(MovimientoInventarioService.TIPOS_MOVIMIENTO);
      
      res.status(200).json({
        status: 'success',
        data: tipos,
        count: tipos.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/movimientos-inventario/:id
  getMovimientoById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Como el service no tiene un método para obtener por ID, implementamos una búsqueda manual
      // En una implementación real, esto sería más eficiente
      const movimientos = await MovimientoInventarioService.consultarPorFecha(
        '2000-01-01', 
        new Date().toISOString().split('T')[0]
      );
      
      const movimiento = movimientos.movimientos.find(m => m.id === parseInt(id));
      
      if (!movimiento) {
        return res.status(404).json({
          status: 'error',
          message: 'Movimiento no encontrado'
        });
      }

      res.status(200).json({
        status: 'success',
        data: movimiento
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/movimientos-inventario/producto/:id_producto/resumen
  getResumenProducto: async (req, res, next) => {
    try {
      const { id_producto } = req.params;
      
      const resultado = await MovimientoInventarioService.consultarPorProducto(parseInt(id_producto));
      
      res.status(200).json({
        status: 'success',
        data: resultado.resumen,
        metadata: {
          id_producto: parseInt(id_producto),
          cantidad_movimientos: resultado.movimientos.length
        }
      });
    } catch (error) {
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/movimientos-inventario/ultimos
  getUltimosMovimientos: async (req, res, next) => {
    try {
      const { limite } = req.query;
      const limiteNum = limite ? parseInt(limite) : 50;
      
      if (limiteNum < 1 || limiteNum > 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'El límite debe estar entre 1 y 1000'
        });
      }

      // Obtenemos movimientos de los últimos 30 días
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);
      
      const resultado = await MovimientoInventarioService.consultarPorFecha(
        fechaInicio.toISOString().split('T')[0],
        fechaFin.toISOString().split('T')[0]
      );
      
      // Limitamos los resultados
      const movimientosLimitados = resultado.movimientos.slice(0, limiteNum);
      
      res.status(200).json({
        status: 'success',
        data: movimientosLimitados,
        metadata: {
          periodo: resultado.resumen.periodo,
          total_en_periodo: resultado.movimientos.length,
          limite_aplicado: limiteNum
        },
        count: movimientosLimitados.length
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/movimientos-inventario/entrada
  createEntrada: async (req, res, next) => {
    try {
      const movimientoData = {
        ...req.body,
        tipo_movimiento: MovimientoInventarioService.TIPOS_MOVIMIENTO.ENTRADA
      };
      const idUsuario = req.user?.id || null;
      
      const nuevoMovimiento = await MovimientoInventarioService.registrarMovimiento(movimientoData, idUsuario);
      
      res.status(201).json({
        status: 'success',
        message: 'Entrada de inventario registrada exitosamente',
        data: nuevoMovimiento
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('debe ser mayor a 0') || 
          error.message.includes('requerido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // POST /api/movimientos-inventario/salida
  createSalida: async (req, res, next) => {
    try {
      const movimientoData = {
        ...req.body,
        tipo_movimiento: MovimientoInventarioService.TIPOS_MOVIMIENTO.SALIDA
      };
      const idUsuario = req.user?.id || null;
      
      const nuevoMovimiento = await MovimientoInventarioService.registrarMovimiento(movimientoData, idUsuario);
      
      res.status(201).json({
        status: 'success',
        message: 'Salida de inventario registrada exitosamente',
        data: nuevoMovimiento
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('debe ser mayor a 0') || 
          error.message.includes('requerido') || error.message.includes('Stock insuficiente')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // POST /api/movimientos-inventario/ajuste
  createAjuste: async (req, res, next) => {
    try {
      const movimientoData = {
        ...req.body,
        tipo_movimiento: MovimientoInventarioService.TIPOS_MOVIMIENTO.AJUSTE
      };
      const idUsuario = req.user?.id || null;
      
      const nuevoMovimiento = await MovimientoInventarioService.registrarMovimiento(movimientoData, idUsuario);
      
      res.status(201).json({
        status: 'success',
        message: 'Ajuste de inventario registrado exitosamente',
        data: nuevoMovimiento
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('debe ser mayor a 0') || 
          error.message.includes('requerido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  }
};