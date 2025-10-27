import { body, validationResult } from 'express-validator';

// Validación para crear categoría
export const validateCreateCategoria = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la categoría es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios y los caracteres -_&'),

  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder los 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,!?\-_&()]+$/)
    .withMessage('La descripción contiene caracteres no válidos'),

  body('id_categoria_padre')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría padre debe ser un número entero positivo'),

  // Validación personalizada para evitar ciclos en la jerarquía
  body().custom(async (value, { req }) => {
    const { id_categoria_padre } = req.body;
    
    if (id_categoria_padre) {
      // Esta validación se completará cuando tengas el DAO de Categoria
      // Placeholder para lógica de prevención de ciclos
      // if (id_categoria_padre === futuro_id_de_la_categoria_actual) {
      //   throw new Error('Una categoría no puede ser padre de sí misma');
      // }
    }
    
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos de la categoría',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar categoría
export const validateUpdateCategoria = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios y los caracteres -_&'),

  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder los 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,!?\-_&()]+$/)
    .withMessage('La descripción contiene caracteres no válidos'),

  body('id_categoria_padre')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría padre debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos de la categoría',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de categoría en parámetros de ruta
export const validateCategoriaId = [
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.categoriaId;
    
    if (!id) {
      throw new Error('ID de categoría es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de categoría debe ser un número entero positivo');
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID de la categoría',
        errors: errors.array()
      });
    }
    next();
  }
];