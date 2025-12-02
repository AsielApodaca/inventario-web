import app from './app.js';
import db from './models/index.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sincronizar modelos (opcional, usar con cuidado en producción)
    if (process.env.NODE_ENV === 'development') {
      // await db.sequelize.sync({ alter: true });
      // console.log('✅ Modelos sincronizados con la base de datos');
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Manejo de señales de cierre
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️ Señal ${signal} recibida. Cerrando servidor...`);
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        try {
          await db.sequelize.close();
          console.log('🔌 Conexión a base de datos cerrada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error cerrando conexión a BD:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('❌ Cierre forzado después de timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Excepción no capturada:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();