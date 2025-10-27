import express from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateLogin, validateRegister } from '../middleware/validation/authValidation.js';

const router = express.Router();

// Rutas públicas de autenticación
router.post('/login', validateLogin, usuarioController.login);
router.post('/register', authenticateToken, requireAdmin, validateRegister, usuarioController.register);
router.get('/verify', authenticateToken, usuarioController.verifyToken);

export default router;