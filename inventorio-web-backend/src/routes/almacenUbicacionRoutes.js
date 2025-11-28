import express from 'express';
import { ubicacionController } from '../controllers/ubicacionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Aplicar autenticación a TODAS las rutas de ubicaciones por almacén
router.use(authenticateToken);

// GET /api/almacenes/:id_almacen/ubicaciones - Obtener ubicaciones por almacén
router.get('/', ubicacionController.getUbicacionesByAlmacen);

export default router;