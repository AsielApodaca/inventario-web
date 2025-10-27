import express from 'express';

// Importar todas las rutas
import authRoutes from './authRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import productoRoutes from './productoRoutes.js';
import categoriaRoutes from './categoriaRoutes.js';
import proveedorRoutes from './proveedorRoutes.js';
import almacenRoutes from './almacenRoutes.js';
import ubicacionRoutes from './ubicacionRoutes.js';
import almacenUbicacionRoutes from './almacenUbicacionRoutes.js';
import inventarioRoutes from './inventarioRoutes.js';
import movimientoInventarioRoutes from './movimientoInventarioRoutes.js';
import ordenCompraRoutes from './ordenCompraRoutes.js';
import detalleOrdenCompraRoutes from './detalleOrdenCompraRoutes.js';

const router = express.Router();

// Configurar todas las rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/productos', productoRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/proveedores', proveedorRoutes);
router.use('/almacenes', almacenRoutes);
router.use('/ubicaciones', ubicacionRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/movimientos-inventario', movimientoInventarioRoutes);
router.use('/ordenes-compra', ordenCompraRoutes);

// Rutas con parámetros (deben ir después de las rutas simples)
router.use('/almacenes/:id_almacen/ubicaciones', almacenUbicacionRoutes);
router.use('/ordenes-compra/:id_orden/detalles', detalleOrdenCompraRoutes);

export default router;