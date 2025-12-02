import UbicacionService from '../services/ubicacionService.js';

export const ubicacionController = {
  // POST /api/ubicaciones
  createUbicacion: async (req, res, next) => {
    try {
      const ubicacionData = req.body;
      const nuevaUbicacion = await UbicacionService.crearUbicacion(ubicacionData);
      
      res.status(201).json({
        status: 'success',
        message: 'Ubicación creada exitosamente',
        data: nuevaUbicacion
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('requerido') || 
          error.message.includes('no existe')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/almacenes/:id_almacen/ubicaciones
  getUbicacionesByAlmacen: async (req, res, next) => {
    try {
      const { id_almacen } = req.params;

      const resultado = await UbicacionService.listarPorAlmacen(parseInt(id_almacen));
      
      res.status(200).json({
        status: 'success',
        data: resultado.ubicaciones,
        metadata: {
          almacen: resultado.almacen,
          resumen: resultado.resumen
        },
        count: resultado.ubicaciones.length
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no existe')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/ubicaciones/:id
  getUbicacionById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const ubicacionDetallada = await UbicacionService.obtenerUbicacionPorId(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: ubicacionDetallada.ubicacion,
        productos: ubicacionDetallada.productos,
        resumen: ubicacionDetallada.resumen
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

  // PUT /api/ubicaciones/:id
  updateUbicacion: async (req, res, next) => {
    try {
      const { id } = req.params;
      const ubicacionData = req.body;
      
      const ubicacionActualizada = await UbicacionService.actualizarUbicacion(parseInt(id), ubicacionData);
      
      res.status(200).json({
        status: 'success',
        message: 'Ubicación actualizada exitosamente',
        data: ubicacionActualizada
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
  }
};