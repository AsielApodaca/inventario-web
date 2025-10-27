import { body, validationResult } from 'express-validator';

// Validación para crear orden de compra
export const validateCreateOrdenCompra = [
  body('id_proveedor')
    .notEmpty()
    .withMessage('El ID del proveedor es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del proveedor debe ser un número entero positivo'),

  body('fecha_orden')
    .optional()
    .isISO8601()
    .withMessage('La fecha de la orden debe tener un formato válido (YYYY-MM-DD)')
    .custom((value) => {
      const fechaOrden = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaOrden > hoy) {
        throw new Error('La fecha de la orden no puede ser futura');
      }
      return true;
    }),

  body('estado')
    .notEmpty()
    .withMessage('El estado de la orden es requerido')
    .isIn(['pendiente', 'completada', 'cancelada', 'en_proceso'])
    .withMessage('El estado debe ser: pendiente, completada, cancelada o en_proceso'),

  body('total')
    .notEmpty()
    .withMessage('El total de la orden es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El total debe ser un número positivo mayor a 0'),

  body('id_usuario')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo'),

  // Validación personalizada para verificar que el proveedor existe
  body().custom(async (value, { req }) => {
    const { id_proveedor } = req.body;
    
    if (id_proveedor) {
      // Placeholder para verificar existencia del proveedor
      // const proveedor = await ProveedorDAO.buscarPorId(id_proveedor);
      // if (!proveedor) {
      //   throw new Error('El proveedor especificado no existe');
      // }
    }
    
    return true;
  }),

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

  body('fecha_orden')
    .optional()
    .isISO8601()
    .withMessage('La fecha de la orden debe tener un formato válido (YYYY-MM-DD)')
    .custom((value) => {
      const fechaOrden = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaOrden > hoy) {
        throw new Error('La fecha de la orden no puede ser futura');
      }
      return true;
    }),

  body('estado')
    .optional()
    .isIn(['pendiente', 'completada', 'cancelada', 'en_proceso'])
    .withMessage('El estado debe ser: pendiente, completada, cancelada o en_proceso'),

  body('total')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El total debe ser un número positivo mayor a 0'),

  body('id_usuario')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo'),

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
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.ordenId;
    
    if (!id) {
      throw new Error('ID de orden de compra es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de orden de compra debe ser un número entero positivo');
    }

    return true;
  }),

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

// Validación para filtrar órdenes por estado
export const validateOrdenCompraFilters = [
  body().custom((value, { req }) => {
    const { estado, id_proveedor, fecha_desde, fecha_hasta } = req.query;
    
    // Validar estado si está presente
    if (estado && !['pendiente', 'completada', 'cancelada', 'en_proceso'].includes(estado)) {
      throw new Error('El estado debe ser: pendiente, completada, cancelada o en_proceso');
    }

    // Validar id_proveedor si está presente
    if (id_proveedor && (!Number.isInteger(Number(id_proveedor)) || Number(id_proveedor) <= 0)) {
      throw new Error('El ID del proveedor debe ser un número entero positivo');
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
        message: 'Errores en los filtros de búsqueda de órdenes',
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