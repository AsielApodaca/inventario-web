import express from 'express';
import { proveedorController } from '../controllers/proveedorController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateProveedor,
  validateUpdateProveedor,
  validateProveedorId
} from '../middleware/validation/proveedorValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de proveedores
router.use(authenticateToken);

// GET /api/proveedores/buscar - Buscar proveedores por nombre
router.get('/buscar', proveedorController.searchProveedores);

// GET /api/proveedores - Obtener todos los proveedores
router.get('/', proveedorController.getAllProveedores);

// GET /api/proveedores/:id - Obtener proveedor por ID
router.get('/:id', validateProveedorId, proveedorController.getProveedorById);

// GET /api/proveedores/:id/estadisticas - Obtener estadísticas del proveedor
router.get('/:id/estadisticas', validateProveedorId, proveedorController.getEstadisticasProveedor);

// GET /api/proveedores/:id/productos - Obtener productos del proveedor
router.get('/:id/productos', validateProveedorId, proveedorController.getProductosByProveedor);

// GET /api/proveedores/:id/ordenes - Obtener órdenes del proveedor
router.get('/:id/ordenes', validateProveedorId, proveedorController.getOrdenesByProveedor);

// POST /api/proveedores - Crear nuevo proveedor
router.post('/', requireAdmin, validateCreateProveedor, proveedorController.createProveedor);

// PUT /api/proveedores/:id - Actualizar proveedor completo
router.put('/:id', requireAdmin, validateProveedorId, validateUpdateProveedor, proveedorController.updateProveedor);

// PATCH /api/proveedores/:id/estado - Cambiar estado del proveedor
router.patch('/:id/estado', requireAdmin, validateProveedorId, proveedorController.changeEstadoProveedor);

// DELETE /api/proveedores/:id - Eliminar proveedor
router.delete('/:id', requireAdmin, validateProveedorId, proveedorController.deleteProveedor);

export default router;