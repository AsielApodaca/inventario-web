import { body, param, query, validationResult } from 'express-validator';

// Validación para crear registro de inventario
export const validateCreateInventario = [
  body('id_producto')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('id_ubicacion')
    .notEmpty()
    .withMessage('El ID de la ubicación es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la ubicación debe ser un número entero positivo'),

  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isFloat({ min: 0 })
    .withMessage('La cantidad debe ser un número positivo o cero'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar registro de inventario
export const validateUpdateInventario = [
  body('id_producto')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('id_ubicacion')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la ubicación debe ser un número entero positivo'),

  body('cantidad')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La cantidad debe ser un número positivo o cero'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de inventario en parámetros de ruta
export const validateInventarioId = [
  param('id')
    .notEmpty()
    .withMessage('ID de inventario es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de inventario debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para consultar inventario por producto
export const validateInventarioByProducto = [
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

// Validación para consultar inventario por ubicación
export const validateInventarioByUbicacion = [
  param('id_ubicacion')
    .notEmpty()
    .withMessage('ID de ubicación es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de ubicación debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID de la ubicación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para transferir inventario entre ubicaciones
export const validateTransferenciaInventario = [
  body('id_producto')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('id_ubicacion_origen')
    .notEmpty()
    .withMessage('El ID de la ubicación de origen es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la ubicación de origen debe ser un número entero positivo'),

  body('id_ubicacion_destino')
    .notEmpty()
    .withMessage('El ID de la ubicación de destino es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la ubicación de destino debe ser un número entero positivo')
    .custom((value, { req }) => {
      if (value === req.body.id_ubicacion_origen) {
        throw new Error('La ubicación de origen y destino no pueden ser la misma');
      }
      return true;
    }),

  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad a transferir es requerida')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en la transferencia de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ajustar cantidad de inventario
export const validateAjusteInventario = [
  body('ajuste')
    .notEmpty()
    .withMessage('El ajuste es requerido')
    .isFloat()
    .withMessage('El ajuste debe ser un número')
    .custom((value) => {
      if (value === 0) {
        throw new Error('El ajuste debe ser diferente de 0');
      }
      return true;
    }),

  body('motivo')
    .notEmpty()
    .withMessage('El motivo del ajuste es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El motivo debe tener entre 3 y 255 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en el ajuste de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];