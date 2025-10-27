import almacenService from '../services/almacenService';

(async () => {
  try {
    console.log('=== Creando almacén ===');
    const nuevo = await almacenService.crearAlmacen({
      nombre: 'Almacén Central',
      direccion: 'Av. Principal 123'
    });
    console.log(' Creado:', nuevo);

    console.log('\n=== Listando almacenes ===');
    const lista = await almacenService.listarAlmacenes();
    console.log(lista);

    console.log('\n=== Obteniendo almacén por ID ===');
    const encontrado = await almacenService.obtenerAlmacenPorId(nuevo.id);
    console.log(' Encontrado:', encontrado);

    console.log('\n=== Actualizando almacén ===');
    const actualizado = await almacenService.actualizarAlmacen(nuevo.id, {
      direccion: 'Calle Actualizada 456'
    });
    console.log(' Actualizado:', actualizado);

  } catch (err) {
    console.error(' Error:', err.message);
  }
})();

