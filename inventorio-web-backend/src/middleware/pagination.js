export const paginationMiddleware = (req, res, next) => {
  // Valores por defecto
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  // Asegurar que los valores sean positivos
  page = page > 0 ? page : 1;
  limit = limit > 0 ? limit : 10;

  // Límite máximo de 100 por página
  if (limit > 100) {
    limit = 100;
  }

  // Calcular offset
  const offset = (page - 1) * limit;

  // Adjuntar a la request
  req.pagination = {
    page,
    limit,
    offset
  };

  next();
};