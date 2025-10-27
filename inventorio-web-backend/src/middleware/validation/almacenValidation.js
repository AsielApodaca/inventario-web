import { body, validationResult } from 'express-validator';

// Validación para crear almacén
export const validateCreateAlmacen = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre del almacén es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,-]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios y los caracteres .,-'),

  body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 500 })
    .withMessage('La dirección debe tener entre 5 y 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ#.,-]+$/)
    .withMessage('La dirección contiene caracteres no válidos'),

  body('responsable')
    .notEmpty()
    .withMessage('El nombre del responsable es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre del responsable debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/)
    .withMessage('El nombre del responsable solo puede contener letras y espacios'),

  // Middleware para manejar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del almacén',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar almacén
export const validateUpdateAlmacen = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,-]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios y los caracteres .,-'),

  body('direccion')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('La dirección debe tener entre 5 y 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ#.,-]+$/)
    .withMessage('La dirección contiene caracteres no válidos'),

  body('responsable')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre del responsable debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/)
    .withMessage('El nombre del responsable solo puede contener letras y espacios'),

  // Middleware para manejar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del almacén',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de almacén en parámetros de ruta
export const validateAlmacenId = [
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.almacenId;
    
    if (!id) {
      throw new Error('ID de almacén es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de almacén debe ser un número entero positivo');
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del almacén',
        errors: errors.array()
      });
    }
    next();
  }
];