import CategoriaService from '../services/categoriaService.js';

export const categoriaController = {
  // GET /api/categorias
  getAllCategorias: async (req, res, next) => {
    try {
      const categorias = await CategoriaService.listarCategorias();
      
      res.status(200).json({
        status: 'success',
        data: categorias,
        count: categorias.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/categorias/raiz
  getCategoriasRaiz: async (req, res, next) => {
    try {
      const categoriasRaiz = await CategoriaService.listarCategoriasRaiz();
      
      res.status(200).json({
        status: 'success',
        data: categoriasRaiz,
        count: categoriasRaiz.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/categorias/:id/subcategorias
  getSubcategorias: async (req, res, next) => {
    try {
      const { id } = req.params;
      const subcategorias = await CategoriaService.listarSubcategorias(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: subcategorias,
        count: subcategorias.length
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

  // GET /api/categorias/:id
  getCategoriaById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const categoria = await CategoriaService.obtenerCategoriaPorId(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: categoria
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

  // POST /api/categorias
  createCategoria: async (req, res, next) => {
    try {
      const categoriaData = req.body;
      const nuevaCategoria = await CategoriaService.crearCategoria(categoriaData);
      
      res.status(201).json({
        status: 'success',
        message: 'Categoría creada exitosamente',
        data: nuevaCategoria
      });
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('no existe')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PUT /api/categorias/:id
  updateCategoria: async (req, res, next) => {
    try {
      const { id } = req.params;
      const categoriaData = req.body;
      
      const categoriaActualizada = await CategoriaService.actualizarCategoria(parseInt(id), categoriaData);
      
      res.status(200).json({
        status: 'success',
        message: 'Categoría actualizada exitosamente',
        data: categoriaActualizada
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada') || 
          error.message.includes('vacío') || error.message.includes('no puede ser su propio padre') ||
          error.message.includes('no existe')) {
        const statusCode = error.message.includes('no encontrada') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // DELETE /api/categorias/:id - Aunque el service no lo tiene, es buena práctica tenerlo
  deleteCategoria: async (req, res, next) => {
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

  // GET /api/categorias/:id/arbol - Método adicional para obtener el árbol completo de categorías
  getArbolCategorias: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Primero obtenemos la categoría principal
      const categoria = await CategoriaService.obtenerCategoriaPorId(parseInt(id));
      
      // Luego obtenemos sus subcategorías recursivamente
      const construirArbol = async (categoriaId) => {
        const categoria = await CategoriaService.obtenerCategoriaPorId(categoriaId);
        const subcategorias = await CategoriaService.listarSubcategorias(categoriaId);
        
        if (subcategorias.length > 0) {
          categoria.subcategorias = await Promise.all(
            subcategorias.map(async (subcat) => await construirArbol(subcat.id))
          );
        }
        
        return categoria;
      };
      
      const arbolCategoria = await construirArbol(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: arbolCategoria
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