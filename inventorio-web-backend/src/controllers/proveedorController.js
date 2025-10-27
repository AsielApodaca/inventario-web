import ProveedorService from '../services/proveedorService.js';

export const proveedorController = {
  // POST /api/proveedores
  createProveedor: async (req, res, next) => {
    try {
      const proveedorData = req.body;
      const nuevoProveedor = await ProveedorService.registrarProveedor(proveedorData);
      
      res.status(201).json({
        status: 'success',
        message: 'Proveedor registrado exitosamente',
        data: nuevoProveedor
      });
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('dígitos') || 
          error.message.includes('formato') || error.message.includes('Ya existe')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/proveedores
  getAllProveedores: async (req, res, next) => {
    try {
      const { activos_solamente, ordenar_por_nombre } = req.query;
      
      const opciones = {};
      if (activos_solamente === 'true') opciones.activos_solamente = true;
      if (ordenar_por_nombre === 'true') opciones.ordenar_por_nombre = true;
      
      const proveedores = await ProveedorService.listarProveedores(opciones);
      
      res.status(200).json({
        status: 'success',
        data: proveedores,
        count: proveedores.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/proveedores/buscar
  searchProveedores: async (req, res, next) => {
    try {
      const { nombre, exacta } = req.query;
      
      if (!nombre) {
        return res.status(400).json({
          status: 'error',
          message: 'El parámetro "nombre" es requerido para la búsqueda'
        });
      }

      const busquedaExacta = exacta === 'true';
      const proveedores = await ProveedorService.buscarPorNombre(nombre, busquedaExacta);
      
      res.status(200).json({
        status: 'success',
        data: proveedores,
        count: proveedores.length,
        filtros: {
          nombre,
          busqueda_exacta: busquedaExacta
        }
      });
    } catch (error) {
      if (error.message.includes('requerido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/proveedores/:id
  getProveedorById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const proveedor = await ProveedorService.obtenerProveedorPorId(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: proveedor
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PUT /api/proveedores/:id
  updateProveedor: async (req, res, next) => {
    try {
      const { id } = req.params;
      const proveedorData = req.body;
      
      const proveedorActualizado = await ProveedorService.actualizarProveedor(parseInt(id), proveedorData);
      
      res.status(200).json({
        status: 'success',
        message: 'Proveedor actualizado exitosamente',
        data: proveedorActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('vacío') || error.message.includes('dígitos') ||
          error.message.includes('formato') || error.message.includes('Ya existe')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PATCH /api/proveedores/:id/estado
  changeEstadoProveedor: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      
      if (typeof activo !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          message: 'El campo "activo" debe ser un valor booleano'
        });
      }

      const proveedorActualizado = await ProveedorService.cambiarEstadoProveedor(parseInt(id), activo);
      
      const accion = activo ? 'activado' : 'desactivado';
      res.status(200).json({
        status: 'success',
        message: `Proveedor ${accion} exitosamente`,
        data: proveedorActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/proveedores/:id/estadisticas
  getEstadisticasProveedor: async (req, res, next) => {
    try {
      const { id } = req.params;
      const estadisticas = await ProveedorService.obtenerEstadisticasProveedor(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: estadisticas
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // DELETE /api/proveedores/:id - Aunque el service no lo tiene, es buena práctica tenerlo
  deleteProveedor: async (req, res, next) => {
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
  },

  // GET /api/proveedores/:id/productos - Método adicional para obtener productos del proveedor
  getProductosByProveedor: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Primero verificamos que el proveedor existe
      const proveedor = await ProveedorService.obtenerProveedorPorId(parseInt(id));
      
      // En una implementación real, aquí llamaríamos a un método del service
      // que obtenga los productos de este proveedor
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de obtener productos por proveedor no implementada',
        data: {
          proveedor,
          productos: []
        }
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/proveedores/:id/ordenes - Método adicional para obtener órdenes del proveedor
  getOrdenesByProveedor: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Primero verificamos que el proveedor existe
      const proveedor = await ProveedorService.obtenerProveedorPorId(parseInt(id));
      
      // En una implementación real, aquí llamaríamos a un método del service
      // que obtenga las órdenes de compra de este proveedor
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de obtener órdenes por proveedor no implementada',
        data: {
          proveedor,
          ordenes: []
        }
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
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