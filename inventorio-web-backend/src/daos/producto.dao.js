import {Producto, Categoria, Proveedor} from '../models';

class ProductoDAO {
  async registrarProducto(data) {
    try {
      return await Producto.create(data);
    } catch (error) {
      throw error;
    }
  }

  async listarProductos() {
    try {
      return await Producto.findAll({ include: ['categoria', 'proveedor'] });
    } catch (error) {
      throw error;
    }
  }

  async buscarPorCodigo(codigo_barras) {
    try {
      return await Producto.findOne({ where: { codigo_barras } });
    } catch (error) {
      throw error;
    }
  }

  async buscarPorNombre(nombre) {
    try {
      return await Producto.findAll({
        where: { nombre },
        include: ['categoria', 'proveedor']
      });
    } catch (error) {
      throw error;
    }
  }

  async filtrarPorCategoria(id_categoria) {
    try {
      return await Producto.findAll({ where: { id_categoria } });
    } catch (error) {
      throw error;
    }
  }

  async actualizarProducto(id, data) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) return null;
      return await producto.update(data);
    } catch (error) {
      throw error;
    }
  }

  async eliminarProducto(id) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) return null;
      await producto.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductoDAO();
