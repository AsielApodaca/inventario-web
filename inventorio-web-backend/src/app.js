import express from 'express';
import cors from 'cors';
import db from './models/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { responseFormatter } from './middleware/responseFormatter.js';
import routes from './routes/index.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(requestLogger); // Logging
app.use(responseFormatter); // Formato consistente de respuestas

// Rutas de health check (públicas)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API de Inventario funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Configurar todas las rutas de la API
app.use('/api', routes);

// Middleware para rutas no encontradas
app.use('*', notFoundHandler);

// Middleware de manejo de errores (SIEMPRE al final)
app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();