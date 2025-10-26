const { Categoria } = require('../models');

class CategoriaDAO {
  async crearCategoria(data) {
    try {
      return await Categoria.create(data);
    } catch (error) {
      throw error;
    }
  }

  async listarCategorias() {
    try {
      return await Categoria.findAll();
    } catch (error) {
      throw error;
    }
  }

  async listarSubcategorias(id_padre) {
    try {
      return await Categoria.findAll({ where: { id_padre } });
    } catch (error) {
      throw error;
    }
  }

  async actualizarCategoria(id, data) {
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria) return null;
      return await categoria.update(data);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CategoriaDAO();
