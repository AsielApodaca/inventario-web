import express from 'express';
import { detalleOrdenCompraController } from '../controllers/detalleOrdenCompraController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateDetalleOrdenCompra, 
  validateUpdateDetalleOrdenCompra, 
  validateDetalleOrdenCompraId,
  validateCreateMultipleDetalles 
} from '../middleware/validation/detalleOrdenCompraValidation.js';

const router = express.Router({ mergeParams: true });

// Aplicar autenticación a TODAS las rutas de detalles de orden
router.use(authenticateToken);

// GET /api/ordenes-compra/:id_orden/detalles - Obtener todos los detalles de una orden
router.get('/', detalleOrdenCompraController.getDetallesByOrden);

// GET /api/ordenes-compra/:id_orden/detalles/:id - Obtener detalle específico
router.get('/:id', validateDetalleOrdenCompraId, detalleOrdenCompraController.getDetalleById);

// GET /api/ordenes-compra/:id_orden/detalles/producto/:id_producto - Obtener detalles por producto
router.get('/producto/:id_producto', detalleOrdenCompraController.getDetallesByProducto);

// POST /api/ordenes-compra/:id_orden/detalles - Crear nuevo detalle
router.post('/', requireAdmin, validateCreateDetalleOrdenCompra, detalleOrdenCompraController.createDetalle);

// POST /api/ordenes-compra/:id_orden/detalles/multiples - Crear múltiples detalles
router.post('/multiples', requireAdmin, validateCreateMultipleDetalles, detalleOrdenCompraController.createMultipleDetalles);

// PUT /api/ordenes-compra/:id_orden/detalles/:id - Actualizar detalle completo
router.put('/:id', requireAdmin, validateDetalleOrdenCompraId, validateUpdateDetalleOrdenCompra, detalleOrdenCompraController.updateDetalle);

// PATCH /api/ordenes-compra/:id_orden/detalles/:id/cantidad - Actualizar solo cantidad
router.patch('/:id/cantidad', requireAdmin, validateDetalleOrdenCompraId, detalleOrdenCompraController.updateCantidadDetalle);

// PATCH /api/ordenes-compra/:id_orden/detalles/:id/precio - Actualizar solo precio
router.patch('/:id/precio', requireAdmin, validateDetalleOrdenCompraId, detalleOrdenCompraController.updatePrecioDetalle);

// DELETE /api/ordenes-compra/:id_orden/detalles/:id - Eliminar detalle
router.delete('/:id', requireAdmin, validateDetalleOrdenCompraId, detalleOrdenCompraController.deleteDetalle);

export default router;