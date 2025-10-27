import categoriaService from '../services/categoriaService';

(async () => {
  console.log('=== Creando categoría ===');
  try {
    const nuevaCategoria = await categoriaService.crearCategoria({
      nombre: 'Electrónica',
      descripcion: 'Productos electrónicos'
    });
    console.log(' Creada:', nuevaCategoria);
  } catch (err) {
    console.error(' Error al crear categoría:', err.message);
  }

  console.log('\n=== Listando todas las categorías ===');
  try {
    const categorias = await categoriaService.listarCategorias();
    console.log(categorias);
  } catch (err) {
    console.error(' Error al listar categorías:', err.message);
  }

  console.log('\n=== Listando categorías raíz ===');
  try {
    const categoriasRaiz = await categoriaService.listarCategoriasRaiz();
    console.log(categoriasRaiz);
  } catch (err) {
    console.error(' Error al listar categorías raíz:', err.message);
  }

  console.log('\n=== Actualizando categoría ===');
  try {
    const categoriaActualizada = await categoriaService.actualizarCategoria(1, {
      nombre: 'Electrónica y Gadgets'
    });
    console.log('✅ Actualizada:', categoriaActualizada);
  } catch (err) {
    console.error(' Error al actualizar categoría:', err.message);
  }
})();
