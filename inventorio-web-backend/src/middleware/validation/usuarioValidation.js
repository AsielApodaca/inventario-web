import { body, validationResult } from 'express-validator';

// Validación para crear usuario
export const validateCreateUsuario = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos')
    .custom(async (username) => {
      // Placeholder para verificar si el username ya existe
      // const usuarioExistente = await UsuarioDAO.buscarPorUsername(username);
      // if (usuarioExistente) {
      //   throw new Error('El nombre de usuario ya está en uso');
      // }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),

  body('rol')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isIn(['admin', 'usuario'])
    .withMessage('El rol debe ser "admin" o "usuario"'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del usuario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualizar usuario
export const validateUpdateUsuario = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),

  body('rol')
    .optional()
    .isIn(['admin', 'usuario'])
    .withMessage('El rol debe ser "admin" o "usuario"'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en los datos del usuario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para login de usuario
export const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en el login',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para ID de usuario en parámetros de ruta
export const validateUsuarioId = [
  body().custom((value, { req }) => {
    const id = req.params.id || req.params.usuarioId;
    
    if (!id) {
      throw new Error('ID de usuario es requerido en los parámetros de la ruta');
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error('ID de usuario debe ser un número entero positivo');
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Error en el ID del usuario',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para cambio de contraseña
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación en el cambio de contraseña',
        errors: errors.array()
      });
    }
    next();
  }
];