import proveedorDAO from '../daos/proveedor.dao.js';
class ProveedorService {
  async registrarProveedor(data) {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre del proveedor es requerido');
    }

    if (!data.telefono || data.telefono.trim() === '') {
      throw new Error('El teléfono del proveedor es requerido');
    }

    const telefonoLimpio = data.telefono.replace(/\D/g, '');
    if (telefonoLimpio.length < 10) {
      throw new Error('El teléfono debe tener al menos 10 dígitos');
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('El formato del email es inválido');
      }
    }

    const proveedorExistente = await proveedorDAO.buscarPorNombre(data.nombre);
    if (proveedorExistente && proveedorExistente.length > 0) {
      throw new Error('Ya existe un proveedor con ese nombre');
    }

    data.nombre = data.nombre.trim();
    data.telefono = data.telefono.trim();
    if (data.email) data.email = data.email.trim().toLowerCase();
    if (data.direccion) data.direccion = data.direccion.trim();
    if (data.contacto) data.contacto = data.contacto.trim();

    return await proveedorDAO.registrarProveedor(data);
  }

  async listarProveedores(opciones = {}) {
    let proveedores = await proveedorDAO.listarProveedores();

    if (opciones.activos_solamente) {
      proveedores = proveedores.filter(p => p.activo !== false);
    }

    if (opciones.ordenar_por_nombre) {
      proveedores.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return proveedores;
  }

  async buscarPorNombre(nombre, busquedaExacta = false) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre es requerido para la búsqueda');
    }

    let proveedores;
    if (busquedaExacta) {
      proveedores = await proveedorDAO.buscarPorNombre(nombre.trim());
    } else {
      const todosProveedores = await proveedorDAO.listarProveedores();
      proveedores = todosProveedores.filter(p => 
        p.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
    }

    return proveedores;
  }

  async obtenerProveedorPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de proveedor inválido');
    }

    const proveedor = await proveedorDAO.actualizarProveedor(id, {});
    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }

    return proveedor;
  }

  async actualizarProveedor(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID de proveedor inválido');
    }

    const proveedorActual = await proveedorDAO.actualizarProveedor(id, {});
    if (!proveedorActual) {
      throw new Error('Proveedor no encontrado');
    }

    if (data.nombre && data.nombre.trim() === '') {
      throw new Error('El nombre del proveedor no puede estar vacío');
    }

    if (data.telefono && data.telefono.trim() === '') {
      throw new Error('El teléfono del proveedor no puede estar vacío');
    }

    if (data.telefono) {
      const telefonoLimpio = data.telefono.replace(/\D/g, '');
      if (telefonoLimpio.length < 10) {
        throw new Error('El teléfono debe tener al menos 10 dígitos');
      }
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('El formato del email es inválido');
      }
    }

    if (data.nombre && data.nombre !== proveedorActual.nombre) {
      const existe = await proveedorDAO.buscarPorNombre(data.nombre);
      if (existe && existe.length > 0) {
        throw new Error('Ya existe un proveedor con ese nombre');
      }
    }

    if (data.nombre) data.nombre = data.nombre.trim();
    if (data.telefono) data.telefono = data.telefono.trim();
    if (data.email) data.email = data.email.trim().toLowerCase();
    if (data.direccion) data.direccion = data.direccion.trim();
    if (data.contacto) data.contacto = data.contacto.trim();

    return await proveedorDAO.actualizarProveedor(id, data);
  }

  async cambiarEstadoProveedor(id, activo) {
    if (!id || isNaN(id)) {
      throw new Error('ID de proveedor inválido');
    }

    const proveedor = await proveedorDAO.actualizarProveedor(id, {});
    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }

    if (!activo) {
     
    }

    return await proveedorDAO.actualizarProveedor(id, { activo });
  }

  async obtenerEstadisticasProveedor(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de proveedor inválido');
    }

    const proveedor = await this.obtenerProveedorPorId(id);

    const estadisticas = {
      proveedor,
      total_ordenes: 0,
      monto_total: 0,
      ultima_orden: null,
    };

    return estadisticas;
  }
}

export default new ProveedorService();