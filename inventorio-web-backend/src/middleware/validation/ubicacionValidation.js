import { body, validationResult } from 'express-validator';

// Validación para crear ubicación
export const validateCreateUbicacion = [
  body('id_almacen')
    .notEmpty()
    .withMessage('El ID del almacén es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del almacén debe ser un número entero positivo'),

  body('pasillo')
    .notEmpty()
    .withMessage('El pasillo es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El pasillo debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El pasillo solo puede contener letras, números, espacios, guiones y guiones bajos'),

  body('estante')
    .notEmpty()
    .withMessage('El estante es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El estante debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El estante solo puede contener letras, números, espacios, guiones y guiones bajos'),

  body('nivel')
    .notEmpty()
    .withMessage('El nivel es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nivel debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El nivel solo puede contener letras, números, espacios, guiones y guiones bajos'),

  // Validación personalizada para evitar duplicados de ubicación
  body().custom(async (value, { req }) => {
    const { id_almacen, pasillo, estante, nivel } = req.body;
    
    // Esta validación debería completarse cuando tengas el DAO de Ubicación
    // Por ahora es un placeholder para la lógica de negocio
    if (pasillo && estante && nivel) {
      // Ejemplo: verificar si ya existe esta combinación en el mismo almacén
      // const existeUbicacion = await UbicacionDAO.buscarPorUbicacionExacta(id_almacen, pasillo, estante, nivel);
      // if (existeUbicacion) {
      //   throw new Error('Ya existe una ubicación con esta combinación de pasillo, estante y nivel en este almacén');
      // }
    }
    
    return true;
  }),

  // Middleware para manejar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos de la ubicación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar ubicación
export const validateUpdateUbicacion = [
  body('id_almacen')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del almacén debe ser un número entero positivo'),

  body('pasillo')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El pasillo debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El pasillo solo puede contener letras, números, espacios, guiones y guiones bajos'),

  body('estante')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El estante debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El estante solo puede contener letras, números, espacios, guiones y guiones bajos'),

  body('nivel')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nivel debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El nivel solo puede contener letras, números, espacios, guiones y guiones bajos'),

  // Middleware para manejar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos de la ubicación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de ubicación en parámetros de ruta
export const validateUbicacionId = [
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.ubicacionId;
    
    if (!id) {
      throw new Error('ID de ubicación es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de ubicación debe ser un número entero positivo');
    }

    return true;
  }),

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

// Validación para filtros de búsqueda de ubicaciones
export const validateUbicacionFilters = [
  body().custom((value, { req }) => {
    const { id_almacen, pasillo, estante, nivel } = req.query;
    
    // Validar que al menos un filtro esté presente
    if (!id_almacen && !pasillo && !estante && !nivel) {
      throw new Error('Se requiere al menos un filtro para la búsqueda (id_almacen, pasillo, estante o nivel)');
    }

    // Validar formato de id_almacen si está presente
    if (id_almacen && (!Number.isInteger(Number(id_almacen)) || Number(id_almacen) <= 0)) {
      throw new Error('El ID del almacén debe ser un número entero positivo');
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores en los filtros de búsqueda',
        errors: errors.array()
      });
    }
    next();
  }
];