import { body, validationResult } from 'express-validator';

// Validación para crear detalle de orden de compra
export const validateCreateDetalleOrdenCompra = [
  body('id_orden')
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

  body('subtotal')
    .notEmpty()
    .withMessage('El subtotal es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El subtotal debe ser un número positivo mayor a 0')
    .custom((value, { req }) => {
      const cantidad = parseFloat(req.body.cantidad);
      const precioUnitario = parseFloat(req.body.precio_unitario);
      const subtotal = parseFloat(value);
      const subtotalCalculado = cantidad * precioUnitario;
      
      // Permitir pequeñas diferencias por redondeo de decimales
      if (Math.abs(subtotal - subtotalCalculado) > 0.01) {
        throw new Error(`El subtotal debe ser igual a cantidad × precio unitario (${cantidad} × ${precioUnitario} = ${subtotalCalculado})`);
      }
      return true;
    }),

  // Validación personalizada para verificar existencia de orden y producto
  body().custom(async (value, { req }) => {
    const { id_orden, id_producto } = req.body;
    
    // Placeholder para verificar existencia de la orden
    // const orden = await OrdenCompraDAO.buscarPorId(id_orden);
    // if (!orden) {
    //   throw new Error('La orden de compra especificada no existe');
    // }
    
    // Placeholder para verificar existencia del producto
    // const producto = await ProductoDAO.buscarPorId(id_producto);
    // if (!producto) {
    //   throw new Error('El producto especificado no existe');
    // }
    
    return true;
  }),

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
  body('id_orden')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la orden debe ser un número entero positivo'),

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

  body('subtotal')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El subtotal debe ser un número positivo mayor a 0')
    .custom((value, { req }) => {
      if (value && req.body.cantidad && req.body.precio_unitario) {
        const cantidad = parseFloat(req.body.cantidad);
        const precioUnitario = parseFloat(req.body.precio_unitario);
        const subtotal = parseFloat(value);
        const subtotalCalculado = cantidad * precioUnitario;
        
        // Permitir pequeñas diferencias por redondeo de decimales
        if (Math.abs(subtotal - subtotalCalculado) > 0.01) {
          throw new Error(`El subtotal debe ser igual a cantidad × precio unitario (${cantidad} × ${precioUnitario} = ${subtotalCalculado})`);
        }
      }
      return true;
    }),

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
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.detalleId;
    
    if (!id) {
      throw new Error('ID de detalle de orden es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de detalle de orden debe ser un número entero positivo');
    }

    return true;
  }),

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
  body()
    .isArray({ min: 1 })
    .withMessage('Se debe enviar un array con al menos un detalle de orden'),
  
  body('*.id_producto')
    .notEmpty()
    .withMessage('El ID del producto es requerido en cada detalle')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo en cada detalle'),

  body('*.cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida en cada detalle')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0 en cada detalle'),

  body('*.precio_unitario')
    .notEmpty()
    .withMessage('El precio unitario es requerido en cada detalle')
    .isFloat({ min: 0.01 })
    .withMessage('El precio unitario debe ser un número positivo mayor a 0 en cada detalle'),

  body('*.subtotal')
    .notEmpty()
    .withMessage('El subtotal es requerido en cada detalle')
    .isFloat({ min: 0.01 })
    .withMessage('El subtotal debe ser un número positivo mayor a 0 en cada detalle')
    .custom((value, { path, req }) => {
      // Obtener el índice del elemento actual
      const index = parseInt(path.match(/\[(\d+)\]/)[1]);
      const detalle = req.body[index];
      
      const cantidad = parseFloat(detalle.cantidad);
      const precioUnitario = parseFloat(detalle.precio_unitario);
      const subtotal = parseFloat(value);
      const subtotalCalculado = cantidad * precioUnitario;
      
      // Permitir pequeñas diferencias por redondeo de decimales
      if (Math.abs(subtotal - subtotalCalculado) > 0.01) {
        throw new Error(`El subtotal del detalle ${index + 1} debe ser igual a cantidad × precio unitario (${cantidad} × ${precioUnitario} = ${subtotalCalculado})`);
      }
      return true;
    }),

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