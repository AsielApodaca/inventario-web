import jwt from 'jsonwebtoken';
import UsuarioDAO from '../daos/usuario.dao.js'; // proximamente se usará el controller de usuario

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe en la base de datos
    const usuario = await UsuarioDAO.buscarPorId(decoded.id);
    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido - usuario no existe'
      });
    }

    // Adjuntar información del usuario a la request
    req.user = {
      id: usuario.id_usuario,
      username: usuario.username,
      rol: usuario.rol
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        status: 'error',
        message: 'Token inválido'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        status: 'error',
        message: 'Token expirado'
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Error al verificar el token'
      });
    }
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Se requieren permisos de administrador'
    });
  }
  next();
};

// Middleware para verificar roles específicos
export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        status: 'error',
        message: 'Permisos insuficientes'
      });
    }
    next();
  };
};