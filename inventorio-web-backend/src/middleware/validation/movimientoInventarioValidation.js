import { body, validationResult } from 'express-validator';

// Validación para crear movimiento de inventario
export const validateCreateMovimientoInventario = [
  body('id_producto')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('tipo_movimiento')
    .notEmpty()
    .withMessage('El tipo de movimiento es requerido')
    .isIn(['entrada', 'salida', 'ajuste'])
    .withMessage('El tipo de movimiento debe ser: entrada, salida o ajuste'),

  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0')
    .custom((value, { req }) => {
      const tipoMovimiento = req.body.tipo_movimiento;
      const cantidad = parseFloat(value);
      
      // Validar que para salidas, la cantidad no sea mayor al stock disponible
      // Esta validación se completará cuando tengamos el DAO de Inventario
      // if (tipoMovimiento === 'salida') {
      //   const stockDisponible = await InventarioDAO.obtenerStockProducto(req.body.id_producto);
      //   if (cantidad > stockDisponible) {
      //     throw new Error(`La cantidad de salida (${cantidad}) no puede ser mayor al stock disponible (${stockDisponible})`);
      //   }
      // }
      
      return true;
    }),

  body('motivo')
    .notEmpty()
    .withMessage('El motivo del movimiento es requerido')
    .isLength({ min: 5, max: 500 })
    .withMessage('El motivo debe tener entre 5 y 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&.,!?()]+$/)
    .withMessage('El motivo contiene caracteres no válidos'),

  body('id_usuario')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo'),

  body('fecha_movimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha del movimiento debe tener un formato válido (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const fechaMovimiento = new Date(value);
        const hoy = new Date();
        
        if (fechaMovimiento > hoy) {
          throw new Error('La fecha del movimiento no puede ser futura');
        }
      }
      return true;
    }),

  // Validación personalizada para verificar existencia del producto
  body().custom(async (value, { req }) => {
    const { id_producto } = req.body;
    
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
        message: 'Errores de validación en los datos del movimiento de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar movimiento de inventario
export const validateUpdateMovimientoInventario = [
  body('id_producto')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),

  body('tipo_movimiento')
    .optional()
    .isIn(['entrada', 'salida', 'ajuste'])
    .withMessage('El tipo de movimiento debe ser: entrada, salida o ajuste'),

  body('cantidad')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0'),

  body('motivo')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('El motivo debe tener entre 5 y 500 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_&.,!?()]+$/)
    .withMessage('El motivo contiene caracteres no válidos'),

  body('id_usuario')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo'),

  body('fecha_movimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha del movimiento debe tener un formato válido (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const fechaMovimiento = new Date(value);
        const hoy = new Date();
        
        if (fechaMovimiento > hoy) {
          throw new Error('La fecha del movimiento no puede ser futura');
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del movimiento de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de movimiento de inventario en parámetros de ruta
export const validateMovimientoInventarioId = [
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.movimientoId;
    
    if (!id) {
      throw new Error('ID de movimiento de inventario es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de movimiento de inventario debe ser un número entero positivo');
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del movimiento de inventario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para consultar movimientos por producto
export const validateMovimientosByProducto = [
  body().custom((value, { req }) => {
    const id_producto = req.params.productoId || req.query.id_producto;
    
    if (!id_producto) {
      throw new Error('ID de producto es requerido para consultar los movimientos');
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

// Validación para consultar movimientos por fecha
export const validateMovimientosByFecha = [
  body().custom((value, { req }) => {
    const { fecha_desde, fecha_hasta } = req.query;
    
    if (!fecha_desde && !fecha_hasta) {
      throw new Error('Se requiere al menos una fecha (fecha_desde o fecha_hasta) para consultar movimientos');
    }

    // Validar fecha_desde si está presente
    if (fecha_desde && !isValidDate(fecha_desde)) {
      throw new Error('La fecha desde debe tener un formato válido (YYYY-MM-DD)');
    }

    // Validar fecha_hasta si está presente
    if (fecha_hasta && !isValidDate(fecha_hasta)) {
      throw new Error('La fecha hasta debe tener un formato válido (YYYY-MM-DD)');
    }

    if (fecha_desde && fecha_hasta) {
      const desde = new Date(fecha_desde);
      const hasta = new Date(fecha_hasta);
      if (desde > hasta) {
        throw new Error('La fecha desde no puede ser mayor que la fecha hasta');
      }
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores en los filtros de fecha para movimientos',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para filtros combinados de movimientos
export const validateMovimientosFilters = [
  body().custom((value, { req }) => {
    const { id_producto, tipo_movimiento, fecha_desde, fecha_hasta } = req.query;
    
    // Validar que al menos un filtro esté presente
    if (!id_producto && !tipo_movimiento && !fecha_desde && !fecha_hasta) {
      throw new Error('Se requiere al menos un filtro para la búsqueda (id_producto, tipo_movimiento, fecha_desde o fecha_hasta)');
    }

    // Validar id_producto si está presente
    if (id_producto && (!Number.isInteger(Number(id_producto)) || Number(id_producto) <= 0)) {
      throw new Error('El ID del producto debe ser un número entero positivo');
    }

    // Validar tipo_movimiento si está presente
    if (tipo_movimiento && !['entrada', 'salida', 'ajuste'].includes(tipo_movimiento)) {
      throw new Error('El tipo de movimiento debe ser: entrada, salida o ajuste');
    }

    // Validar fechas si están presentes
    if (fecha_desde && !isValidDate(fecha_desde)) {
      throw new Error('La fecha desde debe tener un formato válido (YYYY-MM-DD)');
    }

    if (fecha_hasta && !isValidDate(fecha_hasta)) {
      throw new Error('La fecha hasta debe tener un formato válido (YYYY-MM-DD)');
    }

    if (fecha_desde && fecha_hasta) {
      const desde = new Date(fecha_desde);
      const hasta = new Date(fecha_hasta);
      if (desde > hasta) {
        throw new Error('La fecha desde no puede ser mayor que la fecha hasta');
      }
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores en los filtros de búsqueda de movimientos',
        errors: errors.array()
      });
    }
    next();
  }
];

// Función auxiliar para validar fechas
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;
  
  const date = new Date(dateString);
  const timestamp = date.getTime();
  
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }
  
  return date.toISOString().startsWith(dateString);
}