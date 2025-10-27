// Middleware para formatear respuestas de manera consistente
export const responseFormatter = (req, res, next) => {
  // Guardar el método original de res.json
  const originalJson = res.json;
  
  // Sobrescribir res.json para formatear todas las respuestas
  res.json = function(data) {
    // Si ya es una respuesta de error, no formatear
    if (data && data.status === 'error') {
      return originalJson.call(this, data);
    }

    // Formato estándar para respuestas exitosas
    const formattedResponse = {
      status: 'success',
      data: data,
      timestamp: new Date().toISOString()
    };

    // Agregar paginación si existe
    if (req.pagination && Array.isArray(data)) {
      formattedResponse.pagination = {
        page: req.pagination.page,
        limit: req.pagination.limit,
        total: data.length // En una implementación real, esto vendría de la DB
      };
    }

    return originalJson.call(this, formattedResponse);
  };

  next();
};