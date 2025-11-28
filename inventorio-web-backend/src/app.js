import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { responseFormatter } from './middleware/responseFormatter.js';
import routes from './routes/index.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(responseFormatter);

// Rutas de health check (públicas)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API de Inventario funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurar todas las rutas de la API
app.use('/api', routes);

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores (SIEMPRE al final)
app.use(errorHandler);

export default app;