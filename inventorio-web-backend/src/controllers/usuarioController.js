import UsuarioService from '../services/usuarioService.js';

export const usuarioController = {
  // POST /api/auth/register
  register: async (req, res, next) => {
    try {
      const usuarioData = req.body;
      const usuarioCreador = req.user?.id || null; // Desde el middleware de autenticación
      
      const nuevoUsuario = await UsuarioService.crearUsuario(usuarioData, usuarioCreador);
      
      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: nuevoUsuario
      });
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('debe tener') || 
          error.message.includes('formato') || error.message.includes('Rol inválido') ||
          error.message.includes('Ya existe un usuario')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      const resultado = await UsuarioService.autenticarUsuario(email, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Login exitoso',
        data: resultado
      });
    } catch (error) {
      if (error.message.includes('requeridos') || error.message.includes('Credenciales inválidas') ||
          error.message.includes('Usuario inactivo')) {
        const statusCode = error.message.includes('Credenciales inválidas') ? 401 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/usuarios
  getAllUsuarios: async (req, res, next) => {
    try {
      const { rol, activos_solamente } = req.query;
      
      const opciones = {};
      if (rol) opciones.rol = rol;
      if (activos_solamente === 'true') opciones.activos_solamente = true;
      
      const resultado = await UsuarioService.listarUsuarios(opciones);
      
      res.status(200).json({
        status: 'success',
        data: resultado.usuarios,
        metadata: {
          resumen: resultado.resumen
        },
        count: resultado.usuarios.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/usuarios/:id
  getUsuarioById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.buscarPorId(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: usuario
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PUT /api/usuarios/:id
  updateUsuario: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuarioData = req.body;
      const usuarioActualizador = req.user?.id || null;
      
      const usuarioActualizado = await UsuarioService.actualizarUsuario(
        parseInt(id), 
        usuarioData, 
        usuarioActualizador
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('vacío') || error.message.includes('formato') ||
          error.message.includes('Rol inválido') || error.message.includes('Ya existe un usuario') ||
          error.message.includes('debe tener')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PATCH /api/usuarios/:id/password
  changePassword: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      const resultado = await UsuarioService.cambiarPassword(
        parseInt(id), 
        currentPassword, 
        newPassword
      );
      
      res.status(200).json({
        status: 'success',
        message: resultado.mensaje
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') ||
          error.message.includes('requeridas') || error.message.includes('incorrecta') ||
          error.message.includes('debe tener')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 
                          error.message.includes('incorrecta') ? 401 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PATCH /api/usuarios/:id/estado
  changeEstadoUsuario: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      const usuarioActualizador = req.user?.id || null;
      
      if (typeof activo !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          message: 'El campo "activo" debe ser un valor booleano'
        });
      }

      const usuarioActualizado = await UsuarioService.cambiarEstadoUsuario(
        parseInt(id), 
        activo, 
        usuarioActualizador
      );
      
      const accion = activo ? 'activado' : 'desactivado';
      res.status(200).json({
        status: 'success',
        message: `Usuario ${accion} exitosamente`,
        data: usuarioActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') ||
          error.message.includes('No se puede desactivar')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // DELETE /api/usuarios/:id
  deleteUsuario: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuarioEliminador = req.user?.id || null;
      
      const resultado = await UsuarioService.eliminarUsuario(parseInt(id), usuarioEliminador);
      
      res.status(200).json({
        status: 'success',
        message: 'Usuario eliminado exitosamente',
        data: resultado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') ||
          error.message.includes('No se puede eliminar')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/auth/verify
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'Token de autenticación requerido'
        });
      }

      const decoded = await UsuarioService.verificarToken(token);
      
      res.status(200).json({
        status: 'success',
        message: 'Token válido',
        data: decoded
      });
    } catch (error) {
      if (error.message.includes('Token inválido') || error.message.includes('expirado')) {
        return res.status(401).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/usuarios/email/:email
  getUsuarioByEmail: async (req, res, next) => {
    try {
      const { email } = req.params;
      const usuario = await UsuarioService.buscarPorEmail(email);
      
      res.status(200).json({
        status: 'success',
        data: usuario
      });
    } catch (error) {
      if (error.message.includes('requerido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/usuarios/:id/estadisticas
  getEstadisticasUsuario: async (req, res, next) => {
    try {
      const { id } = req.params;
      const estadisticas = await UsuarioService.obtenerEstadisticasUsuario(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: estadisticas
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // POST /api/usuarios/:id/registrar-sesion
  registrarSesion: async (req, res, next) => {
    try {
      const { id } = req.params;
      const resultado = await UsuarioService.registrarSesion(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        message: 'Sesión registrada exitosamente',
        data: resultado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // POST /api/usuarios/verificar-permisos
  verificarPermisos: async (req, res, next) => {
    try {
      const { usuarioId, permisosRequeridos } = req.body;
      
      if (!usuarioId || !permisosRequeridos) {
        return res.status(400).json({
          status: 'error',
          message: 'usuarioId y permisosRequeridos son requeridos'
        });
      }

      const tienePermisos = await UsuarioService.verificarPermisos(
        parseInt(usuarioId), 
        permisosRequeridos
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          tienePermisos,
          usuarioId: parseInt(usuarioId),
          permisosRequeridos
        }
      });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  }
};