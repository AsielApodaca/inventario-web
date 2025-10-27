// Middleware para rutas no encontradas
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.path}`
  });
};

// Middleware de manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en la base de datos',
      errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'El registro ya existe',
      field: err.errors[0]?.path
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de clave foránea: el registro relacionado no existe'
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expirado'
    });
  }

  // Error personalizado para lógica de negocio
  if (err.message && err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Error genérico
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
};