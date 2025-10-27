const productoService = require('../services/productoService');
const categoriaService = require('../services/categoriaService');
const proveedorService = require('../services/proveedorService');

async function testCategoriaService() {
  console.log('\n=== TEST: CATEGORIA SERVICE ===');
  
  try {
    const categoria = await categoriaService.crearCategoria({
      nombre: 'Electrónica',
      descripcion: 'Productos electrónicos'
    });
    console.log(' Categoría creada:', categoria.nombre);

    const categorias = await categoriaService.listarCategorias();
    console.log(' Total categorías:', categorias.length);

    console.log(' CATEGORIA SERVICE: OK');
    return categoria;

  } catch (error) {
    console.log(' ERROR:', error.message);
    throw error;
  }
}

async function testProveedorService() {
  console.log('\n=== TEST: PROVEEDOR SERVICE ===');
  
  try {
    const proveedor = await proveedorService.registrarProveedor({
      nombre: `Tech Supplies ${Date.now()}`,
      telefono: '5551234567',
      email: `contacto${Date.now()}@techsupplies.com`,
      direccion: 'Av. Tecnología 123'
    });
    console.log(' Proveedor creado:', proveedor.nombre);

    console.log(' PROVEEDOR SERVICE: OK');
    return proveedor;

  } catch (error) {
    console.log(' ERROR:', error.message);
    throw error;
  }
}

async function testProductoService() {
  console.log('\n=== TEST: PRODUCTO SERVICE ===');
  
  try {
    const categoria = await testCategoriaService();
    const proveedor = await testProveedorService();

    const codigoUnico = `750${Date.now().toString().slice(-10)}`;
    const producto = await productoService.registrarProducto({
      nombre: 'Laptop HP Pavilion',
      codigo_barras: codigoUnico,
      descripcion: 'Laptop 15.6"',
      precio_compra: 8000,
      precio_venta: 12000,
      id_categoria: categoria.id,
      id_proveedor: proveedor.id
    });
    console.log('Producto creado:', producto.nombre);
    console.log('  Margen:', producto.margen_ganancia + '%');

    console.log(' PRODUCTO SERVICE: OK');
    return producto;

  } catch (error) {
    console.log(' ERROR:', error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('   TESTS DE SERVICES');
  console.log('========================================');

  try {
    await testCategoriaService();
    await testProveedorService();
    await testProductoService();

    console.log('\n========================================');
    console.log('    TODOS LOS TESTS PASARON');
    console.log('========================================\n');

  } catch (error) {
    console.log('\n========================================');
    console.log('    ALGUNOS TESTS FALLARON');
    console.log('========================================\n');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };