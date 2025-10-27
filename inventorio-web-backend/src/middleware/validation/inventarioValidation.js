import { body, validationResult } from 'express-validator';

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

  // Validación personalizada para verificar existencia de producto y ubicación
  body().custom(async (value, { req }) => {
    const { id_producto, id_ubicacion } = req.body;
    
    // Placeholder para verificar existencia del producto
    // const producto = await ProductoDAO.buscarPorId(id_producto);
    // if (!producto) {
    //   throw new Error('El producto especificado no existe');
    // }
    
    // Placeholder para verificar existencia de la ubicación
    // const ubicacion = await UbicacionDAO.buscarPorId(id_ubicacion);
    // if (!ubicacion) {
    //   throw new Error('La ubicación especificada no existe');
    // }
    
    return true;
  }),

  // Validación personalizada para evitar duplicados de producto en la misma ubicación
  body().custom(async (value, { req }) => {
    const { id_producto, id_ubicacion } = req.body;
    
    // Placeholder para verificar si ya existe el producto en esta ubicación
    // const inventarioExistente = await InventarioDAO.buscarPorProductoYUbicacion(id_producto, id_ubicacion);
    // if (inventarioExistente) {
    //   throw new Error('Este producto ya está registrado en esta ubicación');
    // }
    
    return true;
  }),

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
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.inventarioId;
    
    if (!id) {
      throw new Error('ID de inventario es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de inventario debe ser un número entero positivo');
    }

    return true;
  }),

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
  body().custom((value, { req }) => {
    const id_producto = req.params.productoId || req.query.id_producto;
    
    if (!id_producto) {
      throw new Error('ID de producto es requerido para consultar el inventario');
    }

    if (!Number.isInteger(Number(id_producto)) || Number(id_producto) <= 0) {
      throw new Error('ID de producto debe ser un número entero positivo');
    }

    return true;
  }),

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
  body().custom((value, { req }) => {
    const id_ubicacion = req.params.ubicacionId || req.query.id_ubicacion;
    
    if (!id_ubicacion) {
      throw new Error('ID de ubicación es requerido para consultar el inventario');
    }

    if (!Number.isInteger(Number(id_ubicacion)) || Number(id_ubicacion) <= 0) {
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

  body('nueva_cantidad')
    .notEmpty()
    .withMessage('La nueva cantidad es requerida')
    .isFloat({ min: 0 })
    .withMessage('La nueva cantidad debe ser un número positivo o cero'),

  body('motivo')
    .notEmpty()
    .withMessage('El motivo del ajuste es requerido')
    .isLength({ min: 5, max: 255 })
    .withMessage('El motivo debe tener entre 5 y 255 caracteres'),

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