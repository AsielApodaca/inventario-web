import DetalleOrdenCompraService from '../services/detalleOrdenCompraService.js';

export const detalleOrdenCompraController = {
  // POST /api/ordenes-compra/:id_orden/detalles
  createDetalle: async (req, res, next) => {
    try {
      const { id_orden } = req.params;
      const detalleData = {
        ...req.body,
        id_orden: parseInt(id_orden)
      };
      
      const nuevoDetalle = await DetalleOrdenCompraService.agregarDetalle(detalleData);
      
      res.status(201).json({
        status: 'success',
        message: 'Detalle de orden agregado exitosamente',
        data: nuevoDetalle
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('debe ser mayor a 0')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ordenes-compra/:id_orden/detalles
  getDetallesByOrden: async (req, res, next) => {
    try {
      const { id_orden } = req.params;
      const resultado = await DetalleOrdenCompraService.consultarDetallesPorOrden(parseInt(id_orden));
      
      res.status(200).json({
        status: 'success',
        data: resultado.detalles,
        metadata: {
          resumen: resultado.resumen
        },
        count: resultado.detalles.length
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

  // PUT /api/ordenes-compra/:id_orden/detalles/:id
  updateDetalle: async (req, res, next) => {
    try {
      const { id } = req.params;
      const detalleData = req.body;
      
      const detalleActualizado = await DetalleOrdenCompraService.actualizarDetalle(parseInt(id), detalleData);
      
      res.status(200).json({
        status: 'success',
        message: 'Detalle de orden actualizado exitosamente',
        data: detalleActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('debe ser mayor a 0')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // DELETE /api/ordenes-compra/:id_orden/detalles/:id
  deleteDetalle: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Como el service no tiene eliminación implementada, informamos al cliente
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de eliminación no implementada en el servicio'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/ordenes-compra/:id_orden/detalles/multiples
  createMultipleDetalles: async (req, res, next) => {
    try {
      const { id_orden } = req.params;
      const { detalles } = req.body;
      
      if (!Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Se debe enviar un array "detalles" con al menos un elemento'
        });
      }

      const detallesConOrden = detalles.map(detalle => ({
        ...detalle,
        id_orden: parseInt(id_orden)
      }));

      const resultados = await Promise.all(
        detallesConOrden.map(detalle => 
          DetalleOrdenCompraService.agregarDetalle(detalle)
        )
      );

      const totalOrden = resultados.reduce((sum, detalle) => sum + parseFloat(detalle.subtotal || 0), 0);

      res.status(201).json({
        status: 'success',
        message: `${resultados.length} detalles agregados exitosamente`,
        data: resultados,
        metadata: {
          total_orden: totalOrden.toFixed(2),
          cantidad_detalles: resultados.length
        }
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('debe ser mayor a 0')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ordenes-compra/:id_orden/detalles/:id
  getDetalleById: async (req, res, next) => {
    try {
      const { id_orden, id } = req.params;
      
      // Primero obtenemos todos los detalles de la orden
      const resultado = await DetalleOrdenCompraService.consultarDetallesPorOrden(parseInt(id_orden));
      
      // Luego filtramos el detalle específico
      const detalle = resultado.detalles.find(d => d.id === parseInt(id));
      
      if (!detalle) {
        return res.status(404).json({
          status: 'error',
          message: 'Detalle no encontrado'
        });
      }

      res.status(200).json({
        status: 'success',
        data: detalle
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

  // GET /api/ordenes-compra/:id_orden/detalles/producto/:id_producto
  getDetallesByProducto: async (req, res, next) => {
    try {
      const { id_orden, id_producto } = req.params;
      
      const resultado = await DetalleOrdenCompraService.consultarDetallesPorOrden(parseInt(id_orden));
      
      const detallesProducto = resultado.detalles.filter(d => 
        d.id_producto === parseInt(id_producto)
      );

      if (detallesProducto.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No se encontraron detalles para este producto en la orden'
        });
      }

      const totalProducto = detallesProducto.reduce((sum, detalle) => 
        sum + parseFloat(detalle.subtotal || 0), 0
      );

      res.status(200).json({
        status: 'success',
        data: detallesProducto,
        metadata: {
          total_producto: totalProducto.toFixed(2),
          cantidad_detalles: detallesProducto.length
        },
        count: detallesProducto.length
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

  // PATCH /api/ordenes-compra/:id_orden/detalles/:id/cantidad
  updateCantidadDetalle: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      
      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'La cantidad debe ser mayor a 0'
        });
      }

      const detalleActualizado = await DetalleOrdenCompraService.actualizarDetalle(parseInt(id), { cantidad });
      
      res.status(200).json({
        status: 'success',
        message: 'Cantidad del detalle actualizada exitosamente',
        data: detalleActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('debe ser mayor a 0')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PATCH /api/ordenes-compra/:id_orden/detalles/:id/precio
  updatePrecioDetalle: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { precio_unitario } = req.body;
      
      if (!precio_unitario || precio_unitario <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El precio unitario debe ser mayor a 0'
        });
      }

      const detalleActualizado = await DetalleOrdenCompraService.actualizarDetalle(parseInt(id), { precio_unitario });
      
      res.status(200).json({
        status: 'success',
        message: 'Precio unitario del detalle actualizado exitosamente',
        data: detalleActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('debe ser mayor a 0')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  }
};