import express from 'express';
import { ubicacionController } from '../controllers/ubicacionController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateUbicacion,
  validateUpdateUbicacion,
  validateUbicacionId,
  validateUbicacionFilters
} from '../middleware/validation/ubicacionValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de ubicaciones
router.use(authenticateToken);

// POST /api/ubicaciones - Crear nueva ubicación
router.post('/', requireAdmin, validateCreateUbicacion, ubicacionController.createUbicacion);

// GET /api/ubicaciones/:id - Obtener ubicación por ID
router.get('/:id', validateUbicacionId, ubicacionController.getUbicacionById);

// PUT /api/ubicaciones/:id - Actualizar ubicación
router.put('/:id', requireAdmin, validateUbicacionId, validateUpdateUbicacion, ubicacionController.updateUbicacion);

// PATCH /api/ubicaciones/:id/estado - Cambiar estado de la ubicación
router.patch('/:id/estado', requireAdmin, validateUbicacionId, ubicacionController.changeEstadoUbicacion);

export default router;