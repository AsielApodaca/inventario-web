import { body, validationResult } from 'express-validator';

// Validación para login
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
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para registro de usuarios
export const validateRegister = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('rol')
    .isIn(['admin', 'usuario'])
    .withMessage('El rol debe ser admin o usuario'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];