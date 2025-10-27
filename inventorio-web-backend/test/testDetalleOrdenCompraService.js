import detalleOrdenCompraService from '../services/detalleOrdenCompraService';

async function test() {
  try {
    console.log('=== Agregando detalle de orden ===');
    const nuevoDetalle = await detalleOrdenCompraService.agregarDetalle({
      id_orden: 1,
      id_producto: 2,
      cantidad: 5,
      precio_unitario: 100
    });
    console.log(' Detalle agregado:', nuevoDetalle);

    console.log('\n=== Consultando detalles por orden ===');
    const detallesOrden = await detalleOrdenCompraService.consultarDetallesPorOrden(1);
    console.log(' Detalles encontrados:', detallesOrden);

    console.log('\n=== Actualizando detalle ===');
    const detalleActualizado = await detalleOrdenCompraService.actualizarDetalle(nuevoDetalle.id, {
      cantidad: 10,
      precio_unitario: 90
    });
    console.log(' Detalle actualizado:', detalleActualizado);

 
  } catch (error) {
    console.error(' Error:', error.message);
  }
}

test();
