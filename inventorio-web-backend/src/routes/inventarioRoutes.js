import express from 'express';
import { inventarioController } from '../controllers/inventarioController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateInventario,
  validateUpdateInventario,
  validateInventarioId,
  validateInventarioByProducto,
  validateInventarioByUbicacion,
  validateTransferenciaInventario,
  validateAjusteInventario
} from '../middleware/validation/inventarioValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de inventario
router.use(authenticateToken);

// GET /api/inventario - Ruta base (puede usarse para documentación o redirección)
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API de Inventario - Consulte la documentación para los endpoints disponibles'
  });
});

// GET /api/inventario/stock-total - Obtener stock total (no implementado)
router.get('/stock-total', inventarioController.getStockTotal);

// GET /api/inventario/producto/:id_producto - Obtener stock por producto
router.get('/producto/:id_producto', validateInventarioByProducto, inventarioController.getStockByProducto);

// GET /api/inventario/producto/:id_producto/disponibilidad - Verificar disponibilidad
router.get('/producto/:id_producto/disponibilidad', validateInventarioByProducto, inventarioController.verificarDisponibilidad);

// GET /api/inventario/ubicacion/:id_ubicacion - Obtener productos por ubicación
router.get('/ubicacion/:id_ubicacion', validateInventarioByUbicacion, inventarioController.getProductosByUbicacion);

// GET /api/inventario/:id - Obtener registro de inventario por ID
router.get('/:id', validateInventarioId, inventarioController.getInventarioById);

// POST /api/inventario - Registrar producto en ubicación
router.post('/', requireAdmin, validateCreateInventario, inventarioController.createInventario);

// POST /api/inventario/transferir - Transferir inventario entre ubicaciones
router.post('/transferir', requireAdmin, validateTransferenciaInventario, inventarioController.transferirInventario);

// PUT /api/inventario/:id/cantidad - Actualizar cantidad
router.put('/:id/cantidad', requireAdmin, validateInventarioId, inventarioController.updateCantidad);

// PATCH /api/inventario/:id/ajustar - Ajustar inventario
router.patch('/:id/ajustar', requireAdmin, validateInventarioId, validateAjusteInventario, inventarioController.ajustarInventario);

// DELETE /api/inventario/:id - Eliminar registro de inventario
router.delete('/:id', requireAdmin, validateInventarioId, inventarioController.deleteInventario);

export default router;