import AlmacenService from '../services/almacenService.js';

export const almacenController = {
  // GET /api/almacenes
  getAllAlmacenes: async (req, res, next) => {
    try {
      const almacenes = await AlmacenService.listarAlmacenes();
      
      res.status(200).json({
        status: 'success',
        data: almacenes,
        count: almacenes.length
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/almacenes
  createAlmacen: async (req, res, next) => {
    try {
      const almacenData = req.body;
      const nuevoAlmacen = await AlmacenService.crearAlmacen(almacenData);
      
      res.status(201).json({
        status: 'success',
        message: 'Almacén creado exitosamente',
        data: nuevoAlmacen
      });
    } catch (error) {
      // Manejo específico de errores de validación del service
      if (error.message.includes('requerido') || error.message.includes('vacío')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PUT /api/almacenes/:id
  updateAlmacen: async (req, res, next) => {
    try {
      const { id } = req.params;
      const almacenData = req.body;
      
      const almacenActualizado = await AlmacenService.actualizarAlmacen(parseInt(id), almacenData);
      
      res.status(200).json({
        status: 'success',
        message: 'Almacén actualizado exitosamente',
        data: almacenActualizado
      });
    } catch (error) {
      // Manejo específico de errores del service
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || error.message.includes('vacío')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/almacenes/:id - Aunque el service no lo tiene, es buena práctica tenerlo
  getAlmacenById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Como el service no tiene este método, podemos usar listar y filtrar
      const almacenes = await AlmacenService.listarAlmacenes();
      const almacen = almacenes.find(a => a.id === parseInt(id));
      
      if (!almacen) {
        return res.status(404).json({
          status: 'error',
          message: 'Almacén no encontrado'
        });
      }

      res.status(200).json({
        status: 'success',
        data: almacen
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/almacenes/:id - Aunque el service no lo tiene, es buena práctica tenerlo
  deleteAlmacen: async (req, res, next) => {
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