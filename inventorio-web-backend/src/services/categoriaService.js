const categoriaDAO = require('../daos/categoria.dao');

class CategoriaService {
  async crearCategoria(data) {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre de la categoría es requerido');
    }

    if (data.id_padre) {
      const categoriaPadre = await categoriaDAO.actualizarCategoria(data.id_padre, {});
      if (!categoriaPadre) {
        throw new Error('La categoría padre no existe');
      }
    }

    data.nombre = data.nombre.trim();
    if (data.descripcion) data.descripcion = data.descripcion.trim();

    return await categoriaDAO.crearCategoria(data);
  }

  async listarCategorias() {
    return await categoriaDAO.listarCategorias();
  }

  async listarCategoriasRaiz() {
    const categorias = await categoriaDAO.listarCategorias();
    return categorias.filter(cat => !cat.id_padre);
  }

  async listarSubcategorias(id_padre) {
    if (!id_padre || isNaN(id_padre)) {
      throw new Error('ID de categoría padre inválido');
    }

    const categoriaPadre = await categoriaDAO.actualizarCategoria(id_padre, {});
    if (!categoriaPadre) {
      throw new Error('La categoría padre no existe');
    }

    return await categoriaDAO.listarSubcategorias(id_padre);
  }

  async obtenerCategoriaPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de categoría inválido');
    }

    const categoria = await categoriaDAO.actualizarCategoria(id, {});
    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }

    return categoria;
  }

  async actualizarCategoria(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID de categoría inválido');
    }

    if (data.nombre && data.nombre.trim() === '') {
      throw new Error('El nombre de la categoría no puede estar vacío');
    }

    if (data.id_padre && parseInt(data.id_padre) === parseInt(id)) {
      throw new Error('Una categoría no puede ser su propio padre');
    }

    if (data.id_padre) {
      const categoriaPadre = await categoriaDAO.actualizarCategoria(data.id_padre, {});
      if (!categoriaPadre) {
        throw new Error('La categoría padre especificada no existe');
      }
    }

    if (data.nombre) data.nombre = data.nombre.trim();
    if (data.descripcion) data.descripcion = data.descripcion.trim();

    const categoria = await categoriaDAO.actualizarCategoria(id, data);
    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }

    return categoria;
  }
}

module.exports = new CategoriaService();