import express from 'express';
import { ordenCompraController } from '../controllers/ordenCompraController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateOrdenCompra,
  validateUpdateOrdenCompra,
  validateOrdenCompraId,
  validateOrdenCompraFilters
} from '../middleware/validation/ordenCompraValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de órdenes de compra
router.use(authenticateToken);

// GET /api/ordenes-compra/estados/disponibles - Obtener estados disponibles
router.get('/estados/disponibles', ordenCompraController.getEstadosDisponibles);

// GET /api/ordenes-compra - Obtener todas las órdenes (con filtros opcionales)
router.get('/', validateOrdenCompraFilters, ordenCompraController.getAllOrdenesCompra);

// GET /api/ordenes-compra/proveedor/:id_proveedor - Obtener órdenes por proveedor
router.get('/proveedor/:id_proveedor', ordenCompraController.getOrdenesByProveedor);

// GET /api/ordenes-compra/estado/:estado - Obtener órdenes por estado
router.get('/estado/:estado', ordenCompraController.getOrdenesByEstado);

// GET /api/ordenes-compra/:id - Obtener orden por ID
router.get('/:id', validateOrdenCompraId, ordenCompraController.getOrdenCompraById);

// GET /api/ordenes-compra/:id/detalles - Obtener solo detalles de la orden
router.get('/:id/detalles', validateOrdenCompraId, ordenCompraController.getDetallesOrden);

// GET /api/ordenes-compra/:id/total - Obtener total de la orden
router.get('/:id/total', validateOrdenCompraId, ordenCompraController.getTotalOrden);

// POST /api/ordenes-compra - Crear nueva orden de compra
router.post('/', requireAdmin, validateCreateOrdenCompra, ordenCompraController.createOrdenCompra);

// POST /api/ordenes-compra/:id/cancelar - Cancelar orden
router.post('/:id/cancelar', requireAdmin, validateOrdenCompraId, ordenCompraController.cancelarOrden);

// PATCH /api/ordenes-compra/:id/estado - Actualizar estado de la orden
router.patch('/:id/estado', requireAdmin, validateOrdenCompraId, ordenCompraController.updateEstadoOrden);

// PATCH /api/ordenes-compra/:id - Actualizar orden (no permitido)
router.patch('/:id', validateOrdenCompraId, ordenCompraController.updateOrdenCompra);

// DELETE /api/ordenes-compra/:id - Eliminar orden (no implementado)
router.delete('/:id', requireAdmin, validateOrdenCompraId, ordenCompraController.deleteOrdenCompra);

export default router;