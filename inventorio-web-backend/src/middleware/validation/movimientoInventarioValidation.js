import { body, param, validationResult } from 'express-validator';

// Validación para crear movimiento de inventario
export const validateCreateMovimientoInventario = [
  body('id_producto')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('tipo_movimiento')
    .notEmpty()
    .withMessage('El tipo de movimiento es requerido')
    .isIn(['entrada', 'salida', 'ajuste', 'devolucion', 'transferencia'])
    .withMessage('El tipo de movimiento debe ser: entrada, salida, ajuste, devolucion o transferencia'),

  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0'),

  body('motivo')
    .notEmpty()
    .withMessage('El motivo del movimiento es requerido')
    .isLength({ min: 3, max: 500 })
    .withMessage('El motivo debe tener entre 3 y 500 caracteres'),

  // id_usuario NO se requiere en el body, se toma de req.user.id

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del movimiento de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar movimiento de inventario
export const validateUpdateMovimientoInventario = [
  body('id_producto')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('tipo_movimiento')
    .optional()
    .isIn(['entrada', 'salida', 'ajuste', 'devolucion', 'transferencia'])
    .withMessage('El tipo de movimiento debe ser: entrada, salida, ajuste, devolucion o transferencia'),

  body('cantidad')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0'),

  body('motivo')
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage('El motivo debe tener entre 3 y 500 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del movimiento de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de movimiento de inventario en parámetros de ruta
export const validateMovimientoInventarioId = [
  param('id')
    .notEmpty()
    .withMessage('ID de movimiento es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de movimiento debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del movimiento de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para consultar movimientos por producto
export const validateMovimientosByProducto = [
  param('id_producto')
    .notEmpty()
    .withMessage('ID de producto es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de producto debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del producto',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para consultar movimientos por fecha
export const validateMovimientosByFecha = [
  // Las fechas vienen como query params, no necesitan validación estricta aquí
  // El service ya valida los formatos
  (req, res, next) => {
    const { fecha_inicio, fecha_fin } = req.query;
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        status: 'error',
        message: 'Los parámetros fecha_inicio y fecha_fin son requeridos'
      });
    }
    next();
  }
];

// Validación para filtros combinados de movimientos
export const validateMovimientosFilters = [
  (req, res, next) => {
    const { id_producto, fecha_inicio, fecha_fin } = req.query;
    
    // Validar que al menos un filtro esté presente
    if (!id_producto && !fecha_inicio && !fecha_fin) {
      return res.status(400).json({
        status: 'error',
        message: 'Se requiere al menos un filtro (id_producto o rango de fechas)'
      });
    }

    // Validar id_producto si está presente
    if (id_producto && (!Number.isInteger(Number(id_producto)) || Number(id_producto) <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del producto debe ser un número entero positivo'
      });
    }

    next();
  }
];