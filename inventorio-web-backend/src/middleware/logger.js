// Middleware de logging para desarrollo
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log de la request entrante
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  // Interceptar el envío de respuesta para loggear
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };

  next();
};