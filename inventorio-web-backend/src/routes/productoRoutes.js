import express from 'express';
import { productoController } from '../controllers/productoController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateProducto,
  validateUpdateProducto,
  validateProductoId,
  validateProductoSearch
} from '../middleware/validation/productoValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de productos
router.use(authenticateToken);

// GET /api/productos/bajo-stock - Obtener productos con stock bajo
router.get('/bajo-stock', productoController.getProductosBajoStock);

// GET /api/productos/buscar - Buscar productos por nombre
router.get('/buscar', validateProductoSearch, productoController.searchProductos);

// GET /api/productos/codigo/:codigo - Obtener producto por código de barras
router.get('/codigo/:codigo', productoController.getProductoByCode);

// GET /api/productos/categoria/:id_categoria - Obtener productos por categoría
router.get('/categoria/:id_categoria', productoController.getProductosByCategory);

// GET /api/productos - Obtener todos los productos
router.get('/', productoController.getAllProductos);

// GET /api/productos/:id - Obtener producto por ID
router.get('/:id', validateProductoId, productoController.getProductoById);

// GET /api/productos/:id/inventario - Obtener inventario del producto
router.get('/:id/inventario', validateProductoId, productoController.getInventarioProducto);

// GET /api/productos/:id/movimientos - Obtener movimientos del producto
router.get('/:id/movimientos', validateProductoId, productoController.getMovimientosProducto);

// POST /api/productos - Crear nuevo producto
router.post('/', requireAdmin, validateCreateProducto, productoController.createProducto);

// PUT /api/productos/:id - Actualizar producto completo
router.put('/:id', requireAdmin, validateProductoId, validateUpdateProducto, productoController.updateProducto);

// PATCH /api/productos/:id/estado - Cambiar estado del producto
router.patch('/:id/estado', requireAdmin, validateProductoId, productoController.changeEstadoProducto);

// DELETE /api/productos/:id - Eliminar producto
router.delete('/:id', requireAdmin, validateProductoId, productoController.deleteProducto);

export default router;