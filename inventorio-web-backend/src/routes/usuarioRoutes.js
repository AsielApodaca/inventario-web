import express from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateUpdateUsuario, 
  validateUsuarioId,
  validateChangePassword 
} from '../middleware/validation/usuarioValidation.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de usuarios
router.use(authenticateToken);

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', requireAdmin, usuarioController.getAllUsuarios);

// GET /api/usuarios/email/:email - Obtener usuario por email
router.get('/email/:email', requireAdmin, usuarioController.getUsuarioByEmail);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', validateUsuarioId, usuarioController.getUsuarioById);

// GET /api/usuarios/:id/estadisticas - Obtener estadísticas del usuario
router.get('/:id/estadisticas', validateUsuarioId, usuarioController.getEstadisticasUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', requireAdmin, validateUsuarioId, validateUpdateUsuario, usuarioController.updateUsuario);

// PATCH /api/usuarios/:id/password - Cambiar contraseña
router.patch('/:id/password', validateUsuarioId, validateChangePassword, usuarioController.changePassword);

// PATCH /api/usuarios/:id/estado - Cambiar estado del usuario
router.patch('/:id/estado', requireAdmin, validateUsuarioId, usuarioController.changeEstadoUsuario);

// POST /api/usuarios/:id/registrar-sesion - Registrar sesión
router.post('/:id/registrar-sesion', validateUsuarioId, usuarioController.registrarSesion);

// POST /api/usuarios/verificar-permisos - Verificar permisos
router.post('/verificar-permisos', requireAdmin, usuarioController.verificarPermisos);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', requireAdmin, validateUsuarioId, usuarioController.deleteUsuario);

export default router;