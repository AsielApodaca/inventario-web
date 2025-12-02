import { body, param, validationResult } from 'express-validator';

// Validación para crear orden de compra
export const validateCreateOrdenCompra = [
  body('id_proveedor')
    .notEmpty()
    .withMessage('El ID del proveedor es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del proveedor debe ser un número entero positivo'),

  // estado, fecha_orden, total e id_usuario se asignan automáticamente en el servicio

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos de la orden de compra',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar orden de compra
export const validateUpdateOrdenCompra = [
  body('id_proveedor')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del proveedor debe ser un número entero positivo'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'aprobada', 'enviada', 'recibida', 'cancelada'])
    .withMessage('El estado debe ser: pendiente, aprobada, enviada, recibida o cancelada'),

  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El total debe ser un número positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos de la orden de compra',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de orden de compra en parámetros de ruta
export const validateOrdenCompraId = [
  param('id')
    .notEmpty()
    .withMessage('ID de orden de compra es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de orden de compra debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID de la orden de compra',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para filtrar órdenes
export const validateOrdenCompraFilters = [
  (req, res, next) => {
    const { estado, id_proveedor } = req.query;
    
    // Validar estado si está presente
    if (estado && !['pendiente', 'aprobada', 'enviada', 'recibida', 'cancelada'].includes(estado)) {
      return res.status(400).json({
        status: 'error',
        message: 'El estado debe ser: pendiente, aprobada, enviada, recibida o cancelada'
      });
    }

    // Validar id_proveedor si está presente
    if (id_proveedor && (!Number.isInteger(Number(id_proveedor)) || Number(id_proveedor) <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID del proveedor debe ser un número entero positivo'
      });
    }

    next();
  }
];