import { body, param, validationResult } from 'express-validator';

// Validación para crear detalle de orden de compra
// id_orden viene de req.params, subtotal se calcula en el servicio
export const validateCreateDetalleOrdenCompra = [
  param('id_orden')
    .notEmpty()
    .withMessage('El ID de la orden es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la orden debe ser un número entero positivo'),

  body('id_producto')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0'),

  body('precio_unitario')
    .notEmpty()
    .withMessage('El precio unitario es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El precio unitario debe ser un número positivo mayor a 0'),

  // subtotal se calcula automáticamente en el servicio (cantidad * precio_unitario)

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del detalle de orden',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar detalle de orden de compra
export const validateUpdateDetalleOrdenCompra = [
  param('id')
    .notEmpty()
    .withMessage('El ID del detalle es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del detalle debe ser un número entero positivo'),

  body('id_producto')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('cantidad')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0'),

  body('precio_unitario')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio unitario debe ser un número positivo mayor a 0'),

  // subtotal se recalcula automáticamente en el servicio si cambia cantidad o precio

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del detalle de orden',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de detalle de orden en parámetros de ruta
export const validateDetalleOrdenCompraId = [
  param('id')
    .notEmpty()
    .withMessage('El ID del detalle es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del detalle debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del detalle de orden',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para múltiples detalles de orden (creación en lote)
export const validateCreateMultipleDetalles = [
  param('id_orden')
    .notEmpty()
    .withMessage('El ID de la orden es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la orden debe ser un número entero positivo'),

  body('detalles')
    .isArray({ min: 1 })
    .withMessage('Se debe enviar un array "detalles" con al menos un detalle de orden'),
  
  body('detalles.*.id_producto')
    .notEmpty()
    .withMessage('El ID del producto es requerido en cada detalle')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo en cada detalle'),

  body('detalles.*.cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida en cada detalle')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0 en cada detalle'),

  body('detalles.*.precio_unitario')
    .notEmpty()
    .withMessage('El precio unitario es requerido en cada detalle')
    .isFloat({ min: 0.01 })
    .withMessage('El precio unitario debe ser un número positivo mayor a 0 en cada detalle'),

  // subtotal se calcula automáticamente para cada detalle

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los detalles de orden',
        errors: errors.array()
      });
    }
    next();
  }
];