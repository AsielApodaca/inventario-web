import {Orden_Compra, Proveedor} from '../models';

class OrdenCompraDAO {
  async crearOrden(data) {
    try {
      return await Orden_Compra.create(data);
    } catch (error) {
      throw error;
    }
  }

  async listarOrdenes() {
    try {
      return await Orden_Compra.findAll({ include: ['proveedor'] });
    } catch (error) {
      throw error;
    }
  }

  async buscarPorProveedor(id_proveedor) {
    try {
      return await Orden_Compra.findAll({ where: { id_proveedor }, include: ['proveedor'] });
    } catch (error) {
      throw error;
    }
  }

  async filtrarPorEstado(estado) {
    try {
      return await Orden_Compra.findAll({ where: { estado } });
    } catch (error) {
      throw error;
    }
  }

  async actualizarEstado(id, estado) {
    try {
      const orden = await Orden_Compra.findByPk(id);
      if (!orden) return null;
      return await orden.update({ estado });
    } catch (error) {
      throw error;
    }
  }
}

export default new OrdenCompraDAO();
