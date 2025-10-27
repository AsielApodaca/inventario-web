import express from 'express';
import { categoriaController } from '../controllers/categoriaController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateCategoria, 
  validateUpdateCategoria, 
  validateCategoriaId 
} from '../middleware/validation/categoriaValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de categorías
router.use(authenticateToken);

// GET /api/categorias - Obtener todas las categorías
router.get('/', categoriaController.getAllCategorias);

// GET /api/categorias/raiz - Obtener categorías raíz
router.get('/raiz', categoriaController.getCategoriasRaiz);

// GET /api/categorias/:id - Obtener categoría por ID
router.get('/:id', validateCategoriaId, categoriaController.getCategoriaById);

// GET /api/categorias/:id/subcategorias - Obtener subcategorías
router.get('/:id/subcategorias', validateCategoriaId, categoriaController.getSubcategorias);

// POST /api/categorias - Crear nueva categoría (solo admin)
router.post('/', requireAdmin, validateCreateCategoria, categoriaController.createCategoria);

// PUT /api/categorias/:id - Actualizar categoría (solo admin)
router.put('/:id', requireAdmin, validateCategoriaId, validateUpdateCategoria, categoriaController.updateCategoria);

export default router;