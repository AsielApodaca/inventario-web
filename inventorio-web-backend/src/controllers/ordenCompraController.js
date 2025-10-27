import OrdenCompraService from '../services/ordenCompraService.js';

export const ordenCompraController = {
  // POST /api/ordenes-compra
  createOrdenCompra: async (req, res, next) => {
    try {
      const ordenData = req.body;
      const idUsuario = req.user?.id || null;
      
      const nuevaOrden = await OrdenCompraService.crearOrden(ordenData, idUsuario);
      
      res.status(201).json({
        status: 'success',
        message: 'Orden de compra creada exitosamente',
        data: nuevaOrden
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no existe') ||
          error.message.includes('fecha de entrega')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ordenes-compra
  getAllOrdenesCompra: async (req, res, next) => {
    try {
      const { estado, id_proveedor } = req.query;
      
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (id_proveedor) filtros.id_proveedor = id_proveedor;
      
      const resultado = await OrdenCompraService.listarOrdenes(filtros);
      
      res.status(200).json({
        status: 'success',
        data: resultado.ordenes,
        metadata: {
          resumen: resultado.resumen
        },
        count: resultado.ordenes.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/ordenes-compra/proveedor/:id_proveedor
  getOrdenesByProveedor: async (req, res, next) => {
    try {
      const { id_proveedor } = req.params;
      const resultado = await OrdenCompraService.buscarPorProveedor(parseInt(id_proveedor));
      
      res.status(200).json({
        status: 'success',
        data: resultado.ordenes,
        metadata: {
          estadisticas: resultado.estadisticas
        },
        count: resultado.ordenes.length
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

  // GET /api/ordenes-compra/estado/:estado
  getOrdenesByEstado: async (req, res, next) => {
    try {
      const { estado } = req.params;
      const ordenes = await OrdenCompraService.filtrarPorEstado(estado);
      
      res.status(200).json({
        status: 'success',
        data: ordenes,
        count: ordenes.length
      });
    } catch (error) {
      if (error.message.includes('Estado inválido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ordenes-compra/:id
  getOrdenCompraById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const ordenDetallada = await OrdenCompraService.obtenerOrdenPorId(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: ordenDetallada.orden,
        detalles: ordenDetallada.detalles,
        resumen: ordenDetallada.resumen
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PATCH /api/ordenes-compra/:id/estado
  updateEstadoOrden: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;
      const idUsuario = req.user?.id || null;
      
      const ordenActualizada = await OrdenCompraService.actualizarEstado(
        parseInt(id), 
        nuevoEstado, 
        idUsuario
      );
      
      res.status(200).json({
        status: 'success',
        message: `Estado de la orden actualizado a ${nuevoEstado}`,
        data: ordenActualizada
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada') ||
          error.message.includes('No se puede cambiar')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ordenes-compra/:id/total
  getTotalOrden: async (req, res, next) => {
    try {
      const { id } = req.params;
      const total = await OrdenCompraService.calcularTotalOrden(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: {
          id_orden: parseInt(id),
          total: total
        }
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // POST /api/ordenes-compra/:id/cancelar
  cancelarOrden: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const idUsuario = req.user?.id || null;
      
      const ordenCancelada = await OrdenCompraService.cancelarOrden(
        parseInt(id), 
        motivo, 
        idUsuario
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Orden cancelada exitosamente',
        data: ordenCancelada
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada') ||
          error.message.includes('No se puede cambiar') || error.message.includes('motivo')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ordenes-compra/:id/detalles - Método adicional para obtener solo detalles
  getDetallesOrden: async (req, res, next) => {
    try {
      const { id } = req.params;
      const ordenDetallada = await OrdenCompraService.obtenerOrdenPorId(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: ordenDetallada.detalles,
        resumen: ordenDetallada.resumen,
        count: ordenDetallada.detalles.length
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ordenes-compra/estados/disponibles
  getEstadosDisponibles: async (req, res, next) => {
    try {
      const estados = Object.values(OrdenCompraService.ESTADOS);
      
      res.status(200).json({
        status: 'success',
        data: estados,
        count: estados.length
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/ordenes-compra/:id - Aunque el service no tiene actualización general, es buena práctica tenerlo
  updateOrdenCompra: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Como el service solo permite actualizar estado, informamos al cliente
      return res.status(405).json({
        status: 'error',
        message: 'Solo se permite actualizar el estado de la orden. Use PATCH /api/ordenes-compra/:id/estado'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/ordenes-compra/:id - Aunque el service no lo tiene, es buena práctica tenerlo
  deleteOrdenCompra: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Como el service no tiene eliminación, podemos implementar una lógica básica
      // En una implementación real, esto llamaría a un método del service
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de eliminación no implementada en el servicio'
      });
    } catch (error) {
      next(error);
    }
  }
};