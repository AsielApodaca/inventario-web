import express from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateUpdateUsuario, 
  validateUsuarioId,
  validateChangePassword 
} from '../middleware/validation/usuarioValidation.js';

const router = express.Router();

// =================================================================
// 🔓 ZONA PÚBLICA (Rutas que NO necesitan token)
// =================================================================

// 1. EL LOGIN DEBE IR PRIMERO (Según el README: POST /api/usuarios/login)
// Nota: Asegúrate de que usuarioController tenga el método 'login' exportado.
router.post('/login', usuarioController.login); 

// (Opcional) Si necesitas verificar token sin que salte error 401 si falla
// router.get('/verify', usuarioController.verifyToken);


// =================================================================
// 🔒 ZONA PRIVADA (A partir de aquí, TODO requiere Token)
// =================================================================

// Aplicar autenticación a todo lo que siga abajo
router.use(authenticateToken);

// GET /api/usuarios - Obtener todos los usuarios (Solo Admin)
router.get('/', requireAdmin, usuarioController.getAllUsuarios);

// GET /api/usuarios/:id - Obtener usuario por ID (Cualquier usuario autenticado puede ver perfil básico)
router.get('/:id', validateUsuarioId, usuarioController.getUsuarioById);

// PUT /api/usuarios/:id - Actualizar usuario (Solo Admin)
router.put('/:id', requireAdmin, validateUsuarioId, validateUpdateUsuario, usuarioController.updateUsuario);

// PATCH /api/usuarios/:id/password - Cambiar contraseña (Usuario autenticado)
router.patch('/:id/password', validateUsuarioId, validateChangePassword, usuarioController.changePassword);

// DELETE /api/usuarios/:id - Eliminar usuario (Solo Admin)
router.delete('/:id', requireAdmin, validateUsuarioId, usuarioController.deleteUsuario);

export default router;