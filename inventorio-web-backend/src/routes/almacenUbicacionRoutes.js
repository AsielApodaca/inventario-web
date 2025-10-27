import express from 'express';
import { ubicacionController } from '../controllers/ubicacionController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateUbicacionFilters } from '../middleware/validation/ubicacionValidation.js';

const router = express.Router({ mergeParams: true });

// Aplicar autenticación a TODAS las rutas de ubicaciones por almacén
router.use(authenticateToken);

// GET /api/almacenes/:id_almacen/ubicaciones - Obtener ubicaciones por almacén
router.get('/', validateUbicacionFilters, ubicacionController.getUbicacionesByAlmacen);

// GET /api/almacenes/:id_almacen/ubicaciones/buscar - Buscar ubicación por código
router.get('/buscar', ubicacionController.getUbicacionByCode);

// GET /api/almacenes/:id_almacen/ubicaciones/disponibles - Obtener ubicaciones disponibles
router.get('/disponibles', ubicacionController.getUbicacionesDisponibles);

export default router;