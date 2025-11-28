// test/test.js
// Script de pruebas de integración para el API de inventario
// Ejecutar con: npm test (el servidor debe estar corriendo en puerto 3000)

const BASE_URL = 'http://localhost:3000/api';

// Variable para almacenar el token de autenticación
let TOKEN = '';

// Variables para almacenar IDs creados durante las pruebas
const createdIds = {
  almacen: null,
  categoria: null,
  proveedor: null,
  ubicacion: null,
  producto: null,
  inventario: null,
  movimiento: null,
  ordenCompra: null,
  detalleOrden: null
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper para hacer peticiones HTTP
async function request(method, endpoint, body = null, useAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (useAuth && TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

// Helper para imprimir resultados
function printResult(testName, success, details = '') {
  const icon = success ? '✅' : '❌';
  const color = success ? colors.green : colors.red;
  console.log(`${color}${icon} ${testName}${colors.reset}`);
  if (details && !success) {
    console.log(`   ${colors.yellow}${details}${colors.reset}`);
  }
}

function printSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}📋 ${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// ==================== PRUEBAS ====================

async function testLogin() {
  printSection('AUTENTICACIÓN');
  
  // Test 1: Login con credenciales válidas
  const { status, data } = await request('POST', '/usuarios/login', {
    username: 'admin',
    password: 'admin123'
  }, false);

  const success = status === 200 && data.token;
  if (success) {
    TOKEN = data.token;
  }
  printResult('Login con credenciales válidas', success, JSON.stringify(data));
  return success;
}

async function testVerifyToken() {
  // Test 2: Verificar token
  const { status, data } = await request('GET', '/usuarios/verify');
  const success = status === 200 && data.data?.id;
  printResult('Verificar token JWT', success, JSON.stringify(data));
  return success;
}

async function testUsuarios() {
  printSection('USUARIOS');
  
  // Test: Listar usuarios
  const { status, data } = await request('GET', '/usuarios');
  const success = status === 200 && Array.isArray(data.data);
  printResult('Listar usuarios', success, JSON.stringify(data));
  return success;
}

async function testAlmacenes() {
  printSection('ALMACENES');
  
  // Test: Crear almacén
  const createRes = await request('POST', '/almacenes', {
    nombre: 'Almacén Central',
    direccion: 'Calle Principal 123'
  });
  
  let success = createRes.status === 201 && createRes.data.data?.id;
  if (success) {
    createdIds.almacen = createRes.data.data.id;
  }
  printResult('Crear almacén', success, JSON.stringify(createRes.data));

  // Test: Listar almacenes
  const listRes = await request('GET', '/almacenes');
  const listSuccess = listRes.status === 200 && Array.isArray(listRes.data.data);
  printResult('Listar almacenes', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

async function testCategorias() {
  printSection('CATEGORÍAS');
  
  // Test: Crear categoría
  const { status, data } = await request('POST', '/categorias', {
    nombre: 'Electrónicos',
    descripcion: 'Productos electrónicos y gadgets'
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.categoria = data.data.id;
  }
  printResult('Crear categoría', success, JSON.stringify(data));

  // Test: Listar categorías
  const listRes = await request('GET', '/categorias');
  const listSuccess = listRes.status === 200 && Array.isArray(listRes.data.data);
  printResult('Listar categorías', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

async function testProveedores() {
  printSection('PROVEEDORES');
  
  // Test: Crear proveedor
  const { status, data } = await request('POST', '/proveedores', {
    nombre: 'Proveedor Tech',
    telefono: '6441234567',
    email: 'contacto@proveedortech.com',
    direccion: 'Av. Tecnología 456'
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.proveedor = data.data.id;
  }
  printResult('Crear proveedor', success, JSON.stringify(data));

  // Test: Listar proveedores
  const listRes = await request('GET', '/proveedores');
  const listSuccess = listRes.status === 200 && Array.isArray(listRes.data.data);
  printResult('Listar proveedores', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

async function testUbicaciones() {
  printSection('UBICACIONES');
  
  if (!createdIds.almacen) {
    printResult('Crear ubicación', false, 'Se requiere un almacén creado previamente');
    return false;
  }

  // Test: Crear ubicación
  const { status, data } = await request('POST', '/ubicaciones', {
    id_almacen: createdIds.almacen,
    pasillo: 'A',
    estante: '1',
    nivel: '2'
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.ubicacion = data.data.id;
  }
  printResult('Crear ubicación', success, JSON.stringify(data));

  // Test: Listar ubicaciones por almacén
  const listRes = await request('GET', `/ubicaciones/almacen/${createdIds.almacen}`);
  const listSuccess = listRes.status === 200 && Array.isArray(listRes.data.data);
  printResult('Listar ubicaciones por almacén', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

async function testProductos() {
  printSection('PRODUCTOS');
  
  if (!createdIds.categoria || !createdIds.proveedor) {
    printResult('Crear producto', false, 'Se requiere categoría y proveedor creados previamente');
    return false;
  }

  // Test: Crear producto
  const { status, data } = await request('POST', '/productos', {
    nombre: 'Laptop HP',
    descripcion: 'Laptop HP 15 pulgadas',
    precio: 15000.00,
    id_categoria: createdIds.categoria,
    id_proveedor: createdIds.proveedor,
    sku: 'LAP-HP-001',
    stock_minimo: 5,
    stock_maximo: 50
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.producto = data.data.id;
  }
  printResult('Crear producto', success, JSON.stringify(data));

  // Test: Listar productos
  const listRes = await request('GET', '/productos');
  const listSuccess = listRes.status === 200 && Array.isArray(listRes.data.data);
  printResult('Listar productos', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

async function testInventario() {
  printSection('INVENTARIO');
  
  if (!createdIds.producto || !createdIds.ubicacion) {
    printResult('Crear inventario', false, 'Se requiere producto y ubicación creados previamente');
    return false;
  }

  // Test: Crear registro de inventario
  const { status, data } = await request('POST', '/inventario', {
    id_producto: createdIds.producto,
    id_ubicacion: createdIds.ubicacion,
    cantidad: 100
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.inventario = data.data.id;
  }
  printResult('Crear registro de inventario', success, JSON.stringify(data));

  // Test: Obtener stock por producto
  const stockRes = await request('GET', `/inventario/producto/${createdIds.producto}`);
  const stockSuccess = stockRes.status === 200;
  printResult('Obtener stock por producto', stockSuccess, JSON.stringify(stockRes.data));

  return success && stockSuccess;
}

async function testMovimientosInventario() {
  printSection('MOVIMIENTOS DE INVENTARIO');
  
  if (!createdIds.producto || !createdIds.ubicacion) {
    printResult('Crear movimiento', false, 'Se requiere producto y ubicación creados previamente');
    return false;
  }

  // Test: Crear movimiento de inventario (entrada)
  const { status, data } = await request('POST', '/movimientos-inventario', {
    id_producto: createdIds.producto,
    id_ubicacion: createdIds.ubicacion,
    tipo_movimiento: 'entrada',
    cantidad: 50,
    motivo: 'Reposición de stock'
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.movimiento = data.data.id;
  }
  printResult('Crear movimiento de inventario', success, JSON.stringify(data));

  // Test: Listar movimientos
  const listRes = await request('GET', '/movimientos-inventario');
  const listSuccess = listRes.status === 200 && Array.isArray(listRes.data.data);
  printResult('Listar movimientos de inventario', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

async function testOrdenesCompra() {
  printSection('ÓRDENES DE COMPRA');
  
  if (!createdIds.proveedor) {
    printResult('Crear orden de compra', false, 'Se requiere proveedor creado previamente');
    return false;
  }

  // Test: Crear orden de compra
  const { status, data } = await request('POST', '/ordenes-compra', {
    id_proveedor: createdIds.proveedor
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.ordenCompra = data.data.id;
  }
  printResult('Crear orden de compra', success, JSON.stringify(data));

  // Test: Listar órdenes de compra
  const listRes = await request('GET', '/ordenes-compra');
  const listSuccess = listRes.status === 200;
  printResult('Listar órdenes de compra', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

async function testDetallesOrdenCompra() {
  printSection('DETALLES DE ORDEN DE COMPRA');
  
  if (!createdIds.ordenCompra || !createdIds.producto) {
    printResult('Crear detalle de orden', false, 'Se requiere orden de compra y producto creados previamente');
    return false;
  }

  // Test: Agregar detalle a orden de compra
  const { status, data } = await request('POST', `/ordenes-compra/${createdIds.ordenCompra}/detalles`, {
    id_producto: createdIds.producto,
    cantidad: 5,
    precio_unitario: 8000
  });

  const success = status === 201 && data.data?.id;
  if (success) {
    createdIds.detalleOrden = data.data.id;
  }
  printResult('Agregar detalle a orden de compra', success, JSON.stringify(data));

  // Test: Listar detalles de orden
  const listRes = await request('GET', `/ordenes-compra/${createdIds.ordenCompra}/detalles`);
  const listSuccess = listRes.status === 200 && Array.isArray(listRes.data.data);
  printResult('Listar detalles de orden', listSuccess, JSON.stringify(listRes.data));

  return success && listSuccess;
}

// ==================== EJECUTAR PRUEBAS ====================

async function runAllTests() {
  console.log(`\n${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  ${colors.blue}🧪 PRUEBAS DE INTEGRACIÓN - API INVENTARIO${colors.reset}              ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}Servidor: ${BASE_URL}${colors.reset}                        ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}`);

  const results = {
    passed: 0,
    failed: 0
  };

  try {
    // 1. Autenticación
    if (await testLogin()) results.passed++; else results.failed++;
    if (await testVerifyToken()) results.passed++; else results.failed++;

    // 2. Usuarios
    if (await testUsuarios()) results.passed++; else results.failed++;

    // 3. Almacenes
    if (await testAlmacenes()) results.passed++; else results.failed++;

    // 4. Categorías
    if (await testCategorias()) results.passed++; else results.failed++;

    // 5. Proveedores
    if (await testProveedores()) results.passed++; else results.failed++;

    // 6. Ubicaciones
    if (await testUbicaciones()) results.passed++; else results.failed++;

    // 7. Productos
    if (await testProductos()) results.passed++; else results.failed++;

    // 8. Inventario
    if (await testInventario()) results.passed++; else results.failed++;

    // 9. Movimientos de inventario
    if (await testMovimientosInventario()) results.passed++; else results.failed++;

    // 10. Órdenes de compra
    if (await testOrdenesCompra()) results.passed++; else results.failed++;

    // 11. Detalles de orden de compra
    if (await testDetallesOrdenCompra()) results.passed++; else results.failed++;

  } catch (error) {
    console.error(`\n${colors.red}❌ Error durante las pruebas: ${error.message}${colors.reset}`);
    console.error(error.stack);
    results.failed++;
  }

  // Resumen final
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}📊 RESUMEN DE PRUEBAS${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✅ Pasaron: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Fallaron: ${results.failed}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // IDs creados durante las pruebas
  console.log(`${colors.yellow}📝 IDs creados durante las pruebas:${colors.reset}`);
  console.log(JSON.stringify(createdIds, null, 2));

  // Código de salida
  process.exit(results.failed > 0 ? 1 : 0);
}

// Ejecutar
runAllTests();