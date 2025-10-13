const db = require('./models');

async function runTests() {
    console.log('PRUEBAS DEL SISTEMA\n');
    let passed = 0;
    let failed = 0;
    let ids = {};

    console.log('USUARIO:');
    try {
        const u = await db.Usuario.create({username: 'admin_test', password: 'pass123', rol: 'admin'});
        ids.usuario = u.id;
        console.log('Crear - ID:', u.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const u = await db.Usuario.findByPk(ids.usuario);
        console.log('Obtener - User:', u.username);
        passed++;
    } catch (e) { console.log('Obtener:', e.message); failed++; }

    try {
        const us = await db.Usuario.findAll();
        console.log('Listar - Total:', us.length);
        passed++;
    } catch (e) { console.log('Listar:', e.message); failed++; }

    try {
        await db.Usuario.update({rol: 'gerente'}, {where: {id: ids.usuario}});
        console.log('Actualizar');
        passed++;
    } catch (e) { console.log('Actualizar:', e.message); failed++; }

    console.log('\nCATEGORIA:');
    try {
        const c = await db.Categoria.create({nombre: 'Electronica', descripcion: 'Productos electronicos', id_categoria_padre: null});
        ids.categoria = c.id;
        console.log('Crear - ID:', c.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const cs = await db.Categoria.findAll();
        console.log('Listar - Total:', cs.length);
        passed++;
    } catch (e) { console.log('Listar:', e.message); failed++; }

    console.log('\nPROVEEDOR:');
    try {
        const p = await db.Proveedor.create({nombre: 'Tech SA', telefono: '6441234567', email: 'ventas@tech.com', direccion: 'Calle 1'});
        ids.proveedor = p.id;
        console.log('Crear - ID:', p.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const p = await db.Proveedor.findByPk(ids.proveedor);
        console.log('Obtener - Nombre:', p.nombre);
        passed++;
    } catch (e) { console.log('Obtener:', e.message); failed++; }

    console.log('\nALMACEN:');
    try {
        const a = await db.Almacen.create({nombre: 'Principal', direccion: 'Zona Industrial', responsable: 'Juan Perez'});
        ids.almacen = a.id;
        console.log('Crear - ID:', a.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    console.log('\nUBICACION:');
    try {
        const ub = await db.Ubicacion.create({id_almacen: ids.almacen, pasillo: 'A', estante: '1', nivel: '2'});
        ids.ubicacion = ub.id;
        console.log('Crear - ID:', ub.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    console.log('\nPRODUCTO:');
    try {
        const pr = await db.Producto.create({
            codigo_barras: '7501234567890',
            nombre: 'Smartphone X',
            descripcion: 'Telefono inteligente',
            id_categoria: ids.categoria,
            id_proveedor: ids.proveedor,
            precio_compra: 5000,
            precio_venta: 8000,
            stock_minimo: 10,
            stock_maximo: 100
        });
        ids.producto = pr.id;
        console.log('Crear - ID:', pr.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const pr = await db.Producto.findByPk(ids.producto);
        console.log('Obtener - Nombre:', pr.nombre);
        passed++;
    } catch (e) { console.log('Obtener:', e.message); failed++; }

    try {
        const prs = await db.Producto.findAll();
        console.log('Listar - Total:', prs.length);
        passed++;
    } catch (e) { console.log('Listar:', e.message); failed++; }

    console.log('\nINVENTARIO:');
    try {
        const inv = await db.Inventario.create({id_producto: ids.producto, id_ubicacion: ids.ubicacion, cantidad: 50});
        ids.inventario = inv.id;
        console.log('Crear - ID:', inv.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const inv = await db.Inventario.findOne({where: {id_producto: ids.producto}});
        console.log('Obtener por Producto - Cantidad:', inv.cantidad);
        passed++;
    } catch (e) { console.log('Obtener:', e.message); failed++; }

    console.log('\nMOVIMIENTO INVENTARIO:');
    try {
        const mov = await db.MovimientoInventario.create({
            id_producto: ids.producto,
            tipo_movimiento: 'entrada',
            cantidad: 20,
            motivo: 'Compra inicial',
            id_usuario: ids.usuario
        });
        console.log('Crear - ID:', mov.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const movs = await db.MovimientoInventario.findAll({where: {id_producto: ids.producto}});
        console.log('Listar por Producto - Total:', movs.length);
        passed++;
    } catch (e) { console.log('Listar:', e.message); failed++; }

    console.log('\nORDEN COMPRA:');
    try {
        const oc = await db.Orden_Compra.create({
            id_proveedor: ids.proveedor,
            estado: 'pendiente',
            total: 10000,
            id_usuario: ids.usuario
        });
        ids.orden = oc.id;
        console.log('Crear - ID:', oc.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const oc = await db.Orden_Compra.findByPk(ids.orden);
        console.log('Obtener - Estado:', oc.estado);
        passed++;
    } catch (e) { console.log('Obtener:', e.message); failed++; }

    console.log('\nDETALLE ORDEN:');
    try {
        const det = await db.Detalle_Orden_Compra.create({
            id_orden: ids.orden,
            id_producto: ids.producto,
            cantidad: 2,
            precio_unitario: 5000,
            subtotal: 10000
        });
        console.log('Crear - ID:', det.id);
        passed++;
    } catch (e) { console.log('Crear:', e.message); failed++; }

    try {
        const dets = await db.Detalle_Orden_Compra.findAll({where: {id_orden: ids.orden}});
        console.log('Listar por Orden - Total:', dets.length);
        passed++;
    } catch (e) { console.log('Listar:', e.message); failed++; }

    console.log('\nELIMINACION\n');
    try {
        await db.Detalle_Orden_Compra.destroy({where: {id_orden: ids.orden}});
        console.log('Eliminar Detalle Orden');
        passed++;
    } catch (e) { console.log('Eliminar:', e.message); failed++; }

    try {
        await db.Orden_Compra.destroy({where: {id: ids.orden}});
        console.log('Eliminar Orden');
        passed++;
    } catch (e) { console.log('Eliminar:', e.message); failed++; }

    try {
        await db.MovimientoInventario.destroy({where: {id_producto: ids.producto}});
        console.log('Eliminar Movimientos');
        passed++;
    } catch (e) { console.log('Eliminar:', e.message); failed++; }

    try {
        await db.Inventario.destroy({where: {id: ids.inventario}});
        console.log('Eliminar Inventario');
        passed++;
    } catch (e) { console.log('Eliminar:', e.message); failed++; }

    try {
        await db.Producto.destroy({where: {id: ids.producto}});
        console.log('Eliminar Producto');
        passed++;
    } catch (e) { console.log('Eliminar:', e.message); failed++; }

    try {
        await db.Usuario.destroy({where: {id: ids.usuario}});
        console.log('Eliminar Usuario');
        passed++;
    } catch (e) { console.log('Eliminar:', e.message); failed++; }

    console.log('\nRESUMEN');
    console.log('Pasadas:', passed);
    console.log('Fallidas:', failed);
    console.log('Total:', passed + failed);
}

runTests().then(() => {
    console.log('\nPruebas completadas\n');
    process.exit(0);
}).catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
