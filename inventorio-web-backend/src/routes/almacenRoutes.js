import express from 'express';
import { almacenController } from '../controllers/almacenController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateAlmacen, 
  validateUpdateAlmacen, 
  validateAlmacenId 
} from '../middleware/validation/warehouseValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de almacenes
router.use(authenticateToken);

// GET /api/almacenes - Obtener todos los almacenes
router.get('/', almacenController.getAllAlmacenes);

// GET /api/almacenes/:id - Obtener almacén por ID
router.get('/:id', validateAlmacenId, almacenController.getAlmacenById);

// POST /api/almacenes - Crear nuevo almacén (solo admin)
router.post('/', requireAdmin, validateCreateAlmacen, almacenController.createAlmacen);

// PUT /api/almacenes/:id - Actualizar almacén (solo admin)
router.put('/:id', requireAdmin, validateAlmacenId, validateUpdateAlmacen, almacenController.updateAlmacen);

// DELETE /api/almacenes/:id - Eliminar almacén (solo admin)
router.delete('/:id', requireAdmin, validateAlmacenId, almacenController.deleteAlmacen);

export default router;