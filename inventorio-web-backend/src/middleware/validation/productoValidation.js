import { body, validationResult } from 'express-validator';

// Validación para crear producto
export const validateCreateProducto = [
  body('codigo_barras')
    .notEmpty()
    .withMessage('El código de barras es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El código de barras debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('El código de barras solo puede contener letras, números, guiones y guiones bajos'),

  body('nombre')
    .notEmpty()
    .withMessage('El nombre del producto es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&.,!()]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),

  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder los 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&.,!?()]+$/)
    .withMessage('La descripción contiene caracteres no válidos'),

  body('id_categoria')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número entero positivo'),

  body('id_proveedor')
    .notEmpty()
    .withMessage('El proveedor es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del proveedor debe ser un número entero positivo'),

  body('precio_compra')
    .notEmpty()
    .withMessage('El precio de compra es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El precio de compra debe ser un número positivo mayor a 0'),

  body('precio_venta')
    .notEmpty()
    .withMessage('El precio de venta es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El precio de venta debe ser un número positivo mayor a 0')
    .custom((value, { req }) => {
      const precioCompra = parseFloat(req.body.precio_compra);
      const precioVenta = parseFloat(value);
      
      if (precioVenta < precioCompra) {
        throw new Error('El precio de venta no puede ser menor al precio de compra');
      }
      return true;
    }),

  body('stock_minimo')
    .notEmpty()
    .withMessage('El stock mínimo es requerido')
    .isFloat({ min: 0 })
    .withMessage('El stock mínimo debe ser un número positivo o cero'),

  body('stock_maximo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El stock máximo debe ser un número positivo o cero')
    .custom((value, { req }) => {
      if (value) {
        const stockMinimo = parseFloat(req.body.stock_minimo);
        const stockMaximo = parseFloat(value);
        
        if (stockMaximo < stockMinimo) {
          throw new Error('El stock máximo no puede ser menor al stock mínimo');
        }
      }
      return true;
    }),

  // Validación personalizada para verificar que el código de barras sea único
  body().custom(async (value, { req }) => {
    const { codigo_barras } = req.body;
    
    if (codigo_barras) {
      // Placeholder para verificar unicidad del código de barras
      // const productoExistente = await ProductoDAO.buscarPorCodigo(codigo_barras);
      // if (productoExistente) {
      //   throw new Error('El código de barras ya está en uso');
      // }
    }
    
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del producto',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar producto
export const validateUpdateProducto = [
  body('codigo_barras')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El código de barras debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('El código de barras solo puede contener letras, números, guiones y guiones bajos'),

  body('nombre')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&.,!()]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),

  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder los 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&.,!?()]+$/)
    .withMessage('La descripción contiene caracteres no válidos'),

  body('id_categoria')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número entero positivo'),

  body('id_proveedor')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del proveedor debe ser un número entero positivo'),

  body('precio_compra')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio de compra debe ser un número positivo mayor a 0'),

  body('precio_venta')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio de venta debe ser un número positivo mayor a 0')
    .custom((value, { req }) => {
      if (value && req.body.precio_compra) {
        const precioCompra = parseFloat(req.body.precio_compra);
        const precioVenta = parseFloat(value);
        
        if (precioVenta < precioCompra) {
          throw new Error('El precio de venta no puede ser menor al precio de compra');
        }
      }
      return true;
    }),

  body('stock_minimo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El stock mínimo debe ser un número positivo o cero'),

  body('stock_maximo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El stock máximo debe ser un número positivo o cero')
    .custom((value, { req }) => {
      if (value && req.body.stock_minimo) {
        const stockMinimo = parseFloat(req.body.stock_minimo);
        const stockMaximo = parseFloat(value);
        
        if (stockMaximo < stockMinimo) {
          throw new Error('El stock máximo no puede ser menor al stock mínimo');
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del producto',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de producto en parámetros de ruta
export const validateProductoId = [
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.productoId;
    
    if (!id) {
      throw new Error('ID de producto es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
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

// Validación para búsqueda de productos
export const validateProductoSearch = [
  body().custom((value, { req }) => {
    const { nombre, codigo_barras, id_categoria, id_proveedor } = req.query;
    
    // Validar que al menos un criterio de búsqueda esté presente
    if (!nombre && !codigo_barras && !id_categoria && !id_proveedor) {
      throw new Error('Se requiere al menos un criterio de búsqueda (nombre, codigo_barras, id_categoria o id_proveedor)');
    }

    // Validar id_categoria si está presente
    if (id_categoria && (!Number.isInteger(Number(id_categoria)) || Number(id_categoria) <= 0)) {
      throw new Error('El ID de la categoría debe ser un número entero positivo');
    }

    // Validar id_proveedor si está presente
    if (id_proveedor && (!Number.isInteger(Number(id_proveedor)) || Number(id_proveedor) <= 0)) {
      throw new Error('El ID del proveedor debe ser un número entero positivo');
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores en los criterios de búsqueda',
        errors: errors.array()
      });
    }
    next();
  }
];