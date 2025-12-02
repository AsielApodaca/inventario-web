
# Inventario Web - Backend

Sistema de gestión de inventario - API REST con Node.js, Express y Sequelize.

## Requisitos

- Node.js >= 18
- MySQL 8.0+

## Instalación

cd inventorio-web-backend
npm install

## Configuración

Crear archivo `.env` en la raíz del proyecto:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=inventoryweb
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion
PORT=3000

## Base de Datos

### 1. Crear la base de datos

mysql -u root -p -e "CREATE DATABASE inventoryweb;"

### 2. Ejecutar migraciones

npx sequelize-cli db:migrate

### 3. Crear usuario admin inicial

npx sequelize-cli db:seed:all

Credenciales del admin:
- Usuario: admin
- Contraseña: admin123

## Ejecutar el Servidor

# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start

El servidor estará disponible en http://localhost:3000

## Ejecutar Pruebas

# Con el servidor corriendo en otra terminal
npm test

## Endpoints Principales

| Método   | Endpoint                      | Descripción              |
|----------|-------------------------------|--------------------------|
| POST     | /api/usuarios/login           | Autenticación            |
| GET      | /api/usuarios/verify          | Verificar token          |
| GET/POST | /api/almacenes                | Gestión de almacenes     |
| GET/POST | /api/categorias               | Gestión de categorías    |
| GET/POST | /api/proveedores              | Gestión de proveedores   |
| GET/POST | /api/ubicaciones              | Gestión de ubicaciones   |
| GET/POST | /api/productos                | Gestión de productos     |
| GET/POST | /api/inventario               | Gestión de inventario    |
| GET/POST | /api/movimientos-inventario   | Movimientos de stock     |
| GET/POST | /api/ordenes-compra           | Órdenes de compra        |

## Estructura del Proyecto

inventorio-web-backend/
├── config/           # Configuración de Sequelize
├── migrations/       # Migraciones de BD
├── seeders/          # Datos iniciales
├── src/
│   ├── controllers/  # Controladores
│   ├── daos/         # Acceso a datos
│   ├── middleware/   # Middlewares y validaciones
│   ├── models/       # Modelos Sequelize
│   ├── routes/       # Rutas del API
│   ├── services/     # Lógica de negocio
│   ├── app.js        # Configuración Express
│   └── server.js     # Entrada del servidor
└── test/             # Pruebas de integración

