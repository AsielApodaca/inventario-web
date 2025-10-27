import express from 'express';
import { movimientoInventarioController } from '../controllers/movimientoInventarioController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateCreateMovimientoInventario,
  validateUpdateMovimientoInventario,
  validateMovimientoInventarioId,
  validateMovimientosByProducto,
  validateMovimientosByFecha,
  validateMovimientosFilters
} from '../middleware/validation/movimientoInventarioValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de movimientos de inventario
router.use(authenticateToken);

// GET /api/movimientos-inventario/tipos - Obtener tipos de movimiento disponibles
router.get('/tipos', movimientoInventarioController.getTiposMovimiento);

// GET /api/movimientos-inventario/ultimos - Obtener últimos movimientos
router.get('/ultimos', movimientoInventarioController.getUltimosMovimientos);

// GET /api/movimientos-inventario/fecha - Obtener movimientos por rango de fechas
router.get('/fecha', validateMovimientosByFecha, movimientoInventarioController.getMovimientosByFecha);

// GET /api/movimientos-inventario/reporte - Generar reporte de movimientos
router.get('/reporte', validateMovimientosFilters, movimientoInventarioController.getReporteMovimientos);

// GET /api/movimientos-inventario/producto/:id_producto - Obtener movimientos por producto
router.get('/producto/:id_producto', validateMovimientosByProducto, movimientoInventarioController.getMovimientosByProducto);

// GET /api/movimientos-inventario/producto/:id_producto/resumen - Obtener resumen por producto
router.get('/producto/:id_producto/resumen', validateMovimientosByProducto, movimientoInventarioController.getResumenProducto);

// GET /api/movimientos-inventario/:id - Obtener movimiento por ID
router.get('/:id', validateMovimientoInventarioId, movimientoInventarioController.getMovimientoById);

// POST /api/movimientos-inventario - Crear movimiento genérico
router.post('/', requireAdmin, validateCreateMovimientoInventario, movimientoInventarioController.createMovimiento);

// POST /api/movimientos-inventario/entrada - Crear movimiento de entrada
router.post('/entrada', requireAdmin, validateCreateMovimientoInventario, movimientoInventarioController.createEntrada);

// POST /api/movimientos-inventario/salida - Crear movimiento de salida
router.post('/salida', requireAdmin, validateCreateMovimientoInventario, movimientoInventarioController.createSalida);

// POST /api/movimientos-inventario/ajuste - Crear movimiento de ajuste
router.post('/ajuste', requireAdmin, validateCreateMovimientoInventario, movimientoInventarioController.createAjuste);

export default router;