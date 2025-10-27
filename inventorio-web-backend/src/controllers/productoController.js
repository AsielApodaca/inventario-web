import ProductoService from '../services/productoService.js';

export const productoController = {
  // POST /api/productos
  createProducto: async (req, res, next) => {
    try {
      const productoData = req.body;
      const nuevoProducto = await ProductoService.registrarProducto(productoData);
      
      res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        data: nuevoProducto
      });
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('Ya existe') ||
          error.message.includes('no existe') || error.message.includes('negativo') ||
          error.message.includes('menor al precio de compra')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/productos
  getAllProductos: async (req, res, next) => {
    try {
      const { activos_solamente, con_stock } = req.query;
      
      const opciones = {};
      if (activos_solamente === 'true') opciones.activos_solamente = true;
      if (con_stock === 'true') opciones.con_stock = true;
      
      const productos = await ProductoService.listarProductos(opciones);
      
      res.status(200).json({
        status: 'success',
        data: productos,
        count: productos.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/productos/codigo/:codigo
  getProductoByCode: async (req, res, next) => {
    try {
      const { codigo } = req.params;
      const producto = await ProductoService.buscarPorCodigo(codigo);
      
      res.status(200).json({
        status: 'success',
        data: producto
      });
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/productos/buscar
  searchProductos: async (req, res, next) => {
    try {
      const { nombre, exacta } = req.query;
      
      if (!nombre) {
        return res.status(400).json({
          status: 'error',
          message: 'El parámetro "nombre" es requerido para la búsqueda'
        });
      }

      const busquedaParcial = exacta !== 'true';
      const productos = await ProductoService.buscarPorNombre(nombre, busquedaParcial);
      
      res.status(200).json({
        status: 'success',
        data: productos,
        count: productos.length,
        filtros: {
          nombre,
          busqueda_exacta: !busquedaParcial
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

  // GET /api/productos/categoria/:id_categoria
  getProductosByCategory: async (req, res, next) => {
    try {
      const { id_categoria } = req.params;
      const { incluir_subcategorias } = req.query;
      
      const productos = await ProductoService.filtrarPorCategoria(
        parseInt(id_categoria), 
        incluir_subcategorias === 'true'
      );
      
      res.status(200).json({
        status: 'success',
        data: productos,
        count: productos.length,
        filtros: {
          id_categoria: parseInt(id_categoria),
          incluir_subcategorias: incluir_subcategorias === 'true'
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

  // GET /api/productos/:id
  getProductoById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const producto = await ProductoService.obtenerProductoPorId(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: producto
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

  // PUT /api/productos/:id
  updateProducto: async (req, res, next) => {
    try {
      const { id } = req.params;
      const productoData = req.body;
      
      const productoActualizado = await ProductoService.actualizarProducto(parseInt(id), productoData);
      
      res.status(200).json({
        status: 'success',
        message: 'Producto actualizado exitosamente',
        data: productoActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('vacío') || error.message.includes('Ya existe') ||
          error.message.includes('no existe') || error.message.includes('menor al precio de compra')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // DELETE /api/productos/:id
  deleteProducto: async (req, res, next) => {
    try {
      const { id } = req.params;
      const resultado = await ProductoService.eliminarProducto(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        message: 'Producto eliminado exitosamente',
        data: resultado
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

  // PATCH /api/productos/:id/estado
  changeEstadoProducto: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      
      if (typeof activo !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          message: 'El campo "activo" debe ser un valor booleano'
        });
      }

      const productoActualizado = await ProductoService.cambiarEstadoProducto(parseInt(id), activo);
      
      const accion = activo ? 'activado' : 'desactivado';
      res.status(200).json({
        status: 'success',
        message: `Producto ${accion} exitosamente`,
        data: productoActualizado
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

  // GET /api/productos/bajo-stock
  getProductosBajoStock: async (req, res, next) => {
    try {
      const { stock_minimo } = req.query;
      const stockMinimo = stock_minimo ? parseInt(stock_minimo) : 10;
      
      if (stockMinimo < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El stock mínimo no puede ser negativo'
        });
      }

      const productos = await ProductoService.obtenerProductosBajoStock(stockMinimo);
      
      res.status(200).json({
        status: 'success',
        data: productos,
        count: productos.length,
        filtros: {
          stock_minimo: stockMinimo
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/productos/:id/inventario - Método adicional para obtener inventario del producto
  getInventarioProducto: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Primero verificamos que el producto existe
      const producto = await ProductoService.obtenerProductoPorId(parseInt(id));
      
      // En una implementación real, aquí llamaríamos a un método del service
      // que obtenga el inventario de este producto
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de obtener inventario por producto no implementada',
        data: {
          producto,
          inventario: []
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

  // GET /api/productos/:id/movimientos - Método adicional para obtener movimientos del producto
  getMovimientosProducto: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Primero verificamos que el producto existe
      const producto = await ProductoService.obtenerProductoPorId(parseInt(id));
      
      // En una implementación real, aquí llamaríamos a un método del service
      // que obtenga los movimientos de este producto
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de obtener movimientos por producto no implementada',
        data: {
          producto,
          movimientos: []
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