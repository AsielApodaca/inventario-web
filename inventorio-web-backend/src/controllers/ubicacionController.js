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
      // Manejo específico de errores de validación del service
      if (error.message.includes('inválido') || error.message.includes('requerido') || 
          error.message.includes('Tipo de ubicación inválido') || 
          error.message.includes('Ya existe una ubicación') ||
          error.message.includes('no existe') ||
          error.message.includes('no puede ser negativa')) {
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
      const { tipo, ordenar_por } = req.query;
      
      const opciones = {};
      if (tipo) opciones.tipo = tipo;
      if (ordenar_por) opciones.ordenar_por = ordenar_por;

      const resultado = await UbicacionService.listarPorAlmacen(parseInt(id_almacen), opciones);
      
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
        ocupacion: ubicacionDetallada.ocupacion
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
      if (error.message.includes('inválido') || error.message.includes('no encontrada') || 
          error.message.includes('vacío') || error.message.includes('Tipo de ubicación inválido') ||
          error.message.includes('Ya existe una ubicación') ||
          error.message.includes('No se puede reducir la capacidad')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PATCH /api/ubicaciones/:id/estado
  changeEstadoUbicacion: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      
      if (typeof activo !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          message: 'El campo "activo" debe ser un valor booleano'
        });
      }

      const ubicacionActualizada = await UbicacionService.cambiarEstadoUbicacion(parseInt(id), activo);
      
      const accion = activo ? 'activada' : 'desactivada';
      res.status(200).json({
        status: 'success',
        message: `Ubicación ${accion} exitosamente`,
        data: ubicacionActualizada
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada') ||
          error.message.includes('No se puede desactivar')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/almacenes/:id_almacen/ubicaciones/buscar
  getUbicacionByCode: async (req, res, next) => {
    try {
      const { id_almacen } = req.params;
      const { codigo } = req.query;
      
      if (!codigo) {
        return res.status(400).json({
          status: 'error',
          message: 'El parámetro "codigo" es requerido'
        });
      }

      const ubicacionDetallada = await UbicacionService.buscarUbicacionPorCodigo(
        codigo, 
        parseInt(id_almacen)
      );
      
      res.status(200).json({
        status: 'success',
        data: ubicacionDetallada.ubicacion,
        productos: ubicacionDetallada.productos,
        ocupacion: ubicacionDetallada.ocupacion
      });
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('inválido') || 
          error.message.includes('no encontrada')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/almacenes/:id_almacen/ubicaciones/disponibles
  getUbicacionesDisponibles: async (req, res, next) => {
    try {
      const { id_almacen } = req.params;
      const { cantidad } = req.query;
      
      const cantidadRequerida = cantidad ? parseFloat(cantidad) : 1;
      
      if (cantidad && (isNaN(cantidadRequerida) || cantidadRequerida <= 0)) {
        return res.status(400).json({
          status: 'error',
          message: 'La cantidad debe ser un número positivo'
        });
      }

      const ubicacionesDisponibles = await UbicacionService.obtenerUbicacionesDisponibles(
        parseInt(id_almacen), 
        cantidadRequerida
      );
      
      res.status(200).json({
        status: 'success',
        data: ubicacionesDisponibles,
        count: ubicacionesDisponibles.length,
        filtros: {
          cantidad_requerida: cantidadRequerida,
          id_almacen: parseInt(id_almacen)
        }
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
  }
};