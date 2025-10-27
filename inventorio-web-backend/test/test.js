import {sequelize} from '../models';

// Importar todos los DAOs
import UsuarioDAO from '../daos/usuario.dao';

import CategoriaDAO from '../daos/categoria.dao';
import ProveedorDAO from '../daos/proveedor.dao';
import ProductoDAO from '../daos/producto.dao';
import AlmacenDAO from '../daos/almacen.dao';
import UbicacionDAO from '../daos/ubicacion.dao';
import InventarioDAO from '../daos/inventario.dao';
import MovimientoInventarioDAO from '../daos/movimientoinventario.dao';
import OrdenCompraDAO from '../daos/ordencompra.dao';
import DetalleOrdenCompraDAO from '../daos/detalleordencompra.dao';
import ReportesDAO from '../daos/reportes.dao';
import {describe} from 'node:test';

async function testFlujoCompleto() {
  try {
    console.log('\nIniciando pruebas del sistema de inventario...');
    await sequelize.authenticate();

    // 1 Crear usuario y proveedor
    const usuario = await UsuarioDAO.crearUsuario({
      nombre: 'Admin',
      email: 'admin@test.com',
      password: '1234'
    });
    console.log('/////////////////////Usuario creado:', usuario.id);

    const proveedor = await ProveedorDAO.registrarProveedor({
      nombre: 'Proveedor X',
      contacto: '555-1234',
      direccion: 'Av. Central #100'
    });
    console.log('/////////////////////Proveedor creado:', proveedor.id);

    // 2 Crear categoría y producto
    const categoria = await CategoriaDAO.crearCategoria({
      nombre: 'Electrónica',
      descripcion: 'Equipo que hacen uso de la electricidad',
      id_categoria_padre: 1
    });
    console.log('/////////////////////Categoría creada:', categoria.id);

    const producto = await ProductoDAO.registrarProducto({
      codigo_barras: 'ABC12345',
      nombre: 'Teclado mecánico',
      descripcion: 'Teclado retroiluminado RGB',
      id_categoria: categoria.id,
      id_proveedor: proveedor.id,
      precio_compra: 600,
      precio_venta: 950,
      stock_minimo: 5,
      stock_maximo: 100
    });
    console.log('/////////////////////Producto creado:', producto.id);

    // 3 Crear almacén y ubicación
    const almacen = await AlmacenDAO.crearAlmacen({
      nombre: 'Bodega principal',
      direccion: 'Zona Industrial #45'
    });
    const ubicacion = await UbicacionDAO.crearUbicacion({
      nombre: 'Estante A1',
      id_almacen: almacen.id
    });
    console.log('/////////////////////Almacén y ubicación creados:', almacen.id, ubicacion.id);

    // 4 Registrar producto en inventario
    const inventario = await InventarioDAO.registrarProductoEnUbicacion({
      id_producto: producto.id,
      id_ubicacion: ubicacion.id,
      cantidad: 50
    });
    console.log('/////////////////////Producto agregado al inventario:', inventario.id);

    // 5 Registrar un movimiento de inventario
    const movimiento = await MovimientoInventarioDAO.registrarMovimiento({
      id_producto: producto.id,
      tipo_movimiento: 'entrada',
      motivo: 'Compra inicial',
      id_usuario: usuario.id,
      fecha_movimiento: new Date()
    });
    console.log('/////////////////////Movimiento registrado:', movimiento.id);

    // 6 Crear orden de compra y detalle
    const orden = await OrdenCompraDAO.crearOrden({
      id_proveedor: proveedor.id,
      fecha_orden: new Date(),
      estado: 'pendiente',
      total: 1200.0,
      id_usuario: usuario.id
    });
    console.log('/////////////////////Orden registrada:', orden.id);

    const detalle = await DetalleOrdenCompraDAO.agregarDetalle({
      id_orden: orden.id,
      id_producto: producto.id,
      cantidad: 20.0,
      precio_unitario: 600.0,
      subtotal: 20*600
    });
    console.log('/////////////////////Detalle de orden creado:', detalle.id);

    // 7 Consultar reportes
    const stock = await ReportesDAO.reporteStockTotal();
    console.log('/////////////////////Reporte de stock total:', stock.length, 'registros');

    const movimientos = await ReportesDAO.movimientosDiarios(new Date());
    console.log('/////////////////////Movimientos del día:', movimientos.length);

    const valorTotal = await ReportesDAO.valorTotalInventario();
    console.log('/////////////////////Valor total del inventario:', valorTotal);

    const pendientes = await ReportesDAO.ordenesPendientes();
    console.log('/////////////////////Ordenes pendientes:', pendientes.length);


    console.log('\n /////////////////////Todas las pruebas pasaron con exito');

    await sequelize.close();
  } catch (error) {
    console.error('\n Error en el flujo completo:', error);
    await sequelize.close();
  }
}

testFlujoCompleto();
