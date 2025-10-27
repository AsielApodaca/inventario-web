import { body, validationResult } from 'express-validator';

// Validación para crear proveedor
export const validateCreateProveedor = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre del proveedor es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ&.,-]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios y los caracteres &.,-'),

  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/)
    .withMessage('El formato del teléfono no es válido')
    .isLength({ min: 10, max: 15 })
    .withMessage('El teléfono debe tener entre 10 y 15 caracteres'),

  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El formato del email no es válido')
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder los 255 caracteres')
    .normalizeEmail(),

  body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 500 })
    .withMessage('La dirección debe tener entre 5 y 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ#.,-\/]+$/)
    .withMessage('La dirección contiene caracteres no válidos'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del proveedor',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar proveedor
export const validateUpdateProveedor = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ&.,-]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios y los caracteres &.,-'),

  body('telefono')
    .optional()
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/)
    .withMessage('El formato del teléfono no es válido')
    .isLength({ min: 10, max: 15 })
    .withMessage('El teléfono debe tener entre 10 y 15 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El formato del email no es válido')
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder los 255 caracteres')
    .normalizeEmail(),

  body('direccion')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('La dirección debe tener entre 5 y 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ#.,-\/]+$/)
    .withMessage('La dirección contiene caracteres no válidos'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del proveedor',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de proveedor en parámetros de ruta
export const validateProveedorId = [
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.proveedorId;
    
    if (!id) {
      throw new Error('ID de proveedor es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de proveedor debe ser un número entero positivo');
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del proveedor',
        errors: errors.array()
      });
    }
    next();
  }
];