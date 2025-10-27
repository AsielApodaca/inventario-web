const productoDAO = require('../daos/producto.dao.js');
const categoriaDAO = require('../daos/categoria.dao.js');
const proveedorDAO = require('../daos/proveedor.dao.js');
const { Op } = require('sequelize');

async function registrarProducto(data) {
  if (!data.nombre || data.nombre.trim() === '') {
    throw new Error('El nombre del producto es requerido');
  }

  if (!data.codigo_barras || data.codigo_barras.trim() === '') {
    throw new Error('El código de barras es requerido');
  }

  const productoExistente = await productoDAO.buscarPorCodigo(data.codigo_barras);
  if (productoExistente) {
    throw new Error('Ya existe un producto con ese código de barras');
  }

  if (data.id_categoria) {
    const categoria = await categoriaDAO.actualizarCategoria(data.id_categoria, {});
    if (!categoria) {
      throw new Error('La categoría especificada no existe');
    }
  }

  if (data.id_proveedor) {
    const proveedor = await proveedorDAO.actualizarProveedor(data.id_proveedor, {});
    if (!proveedor) {
      throw new Error('El proveedor especificado no existe');
    }
  }

  if (data.precio_compra && data.precio_compra < 0) {
    throw new Error('El precio de compra no puede ser negativo');
  }

  if (data.precio_venta && data.precio_venta < 0) {
    throw new Error('El precio de venta no puede ser negativo');
  }

  if (data.precio_compra && data.precio_venta && data.precio_venta < data.precio_compra) {
    throw new Error('El precio de venta no puede ser menor al precio de compra');
  }

  data.nombre = data.nombre.trim();
  data.codigo_barras = data.codigo_barras.trim();
  if (data.descripcion) data.descripcion = data.descripcion.trim();

  if (data.precio_compra && data.precio_venta) {
    data.margen_ganancia = ((data.precio_venta - data.precio_compra) / data.precio_compra * 100).toFixed(2);
  }

  return await productoDAO.registrarProducto(data);
}

async function listarProductos(opciones = {}) {
  let productos = await productoDAO.listarProductos();

  if (opciones.activos_solamente) {
    productos = productos.filter(p => p.activo !== false);
  }

  if (opciones.con_stock) {
    // Implementar filtro de stock
  }

  return productos;
}

async function buscarPorCodigo(codigo_barras) {
  if (!codigo_barras || codigo_barras.trim() === '') {
    throw new Error('El código de barras es requerido');
  }

  const producto = await productoDAO.buscarPorCodigo(codigo_barras.trim());
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  return producto;
}

async function buscarPorNombre(nombre, busquedaParcial = true) {
  if (!nombre || nombre.trim() === '') {
    throw new Error('El nombre es requerido para la búsqueda');
  }

  let productos;
  if (busquedaParcial) {
    const todosProductos = await productoDAO.listarProductos();
    productos = todosProductos.filter(p => 
      p.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  } else {
    productos = await productoDAO.buscarPorNombre(nombre);
  }

  return productos;
}

async function filtrarPorCategoria(id_categoria, incluirSubcategorias = false) {
  if (!id_categoria || isNaN(id_categoria)) {
    throw new Error('ID de categoría inválido');
  }

  let productos = await productoDAO.filtrarPorCategoria(id_categoria);

  if (incluirSubcategorias) {
    const subcategorias = await categoriaDAO.listarSubcategorias(id_categoria);
    for (const subcat of subcategorias) {
      const productosSubcat = await productoDAO.filtrarPorCategoria(subcat.id);
      productos = [...productos, ...productosSubcat];
    }
  }

  return productos;
}

async function obtenerProductoPorId(id) {
  if (!id || isNaN(id)) {
    throw new Error('ID de producto inválido');
  }

  const producto = await productoDAO.actualizarProducto(id, {});
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  return producto;
}

async function actualizarProducto(id, data) {
  if (!id || isNaN(id)) {
    throw new Error('ID de producto inválido');
  }

  const productoActual = await productoDAO.actualizarProducto(id, {});
  if (!productoActual) {
    throw new Error('Producto no encontrado');
  }

  if (data.nombre && data.nombre.trim() === '') {
    throw new Error('El nombre del producto no puede estar vacío');
  }

  if (data.codigo_barras && data.codigo_barras !== productoActual.codigo_barras) {
    const existe = await productoDAO.buscarPorCodigo(data.codigo_barras);
    if (existe) {
      throw new Error('Ya existe un producto con ese código de barras');
    }
  }

  if (data.id_categoria) {
    const categoria = await categoriaDAO.actualizarCategoria(data.id_categoria, {});
    if (!categoria) {
      throw new Error('La categoría especificada no existe');
    }
  }

  if (data.id_proveedor) {
    const proveedor = await proveedorDAO.actualizarProveedor(data.id_proveedor, {});
    if (!proveedor) {
      throw new Error('El proveedor especificado no existe');
    }
  }

  const precioCompra = data.precio_compra || productoActual.precio_compra;
  const precioVenta = data.precio_venta || productoActual.precio_venta;

  if (precioVenta && precioCompra && precioVenta < precioCompra) {
    throw new Error('El precio de venta no puede ser menor al precio de compra');
  }

  if (data.nombre) data.nombre = data.nombre.trim();
  if (data.codigo_barras) data.codigo_barras = data.codigo_barras.trim();
  if (data.descripcion) data.descripcion = data.descripcion.trim();

  if (data.precio_compra || data.precio_venta) {
    data.margen_ganancia = ((precioVenta - precioCompra) / precioCompra * 100).toFixed(2);
  }

  return await productoDAO.actualizarProducto(id, data);
}

async function eliminarProducto(id) {
  if (!id || isNaN(id)) {
    throw new Error('ID de producto inválido');
  }

  const producto = await productoDAO.actualizarProducto(id, {});
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  return await productoDAO.eliminarProducto(id);
}

async function cambiarEstadoProducto(id, activo) {
  return await actualizarProducto(id, { activo });
}

async function obtenerProductosBajoStock(stock_minimo = 10) {
  const productos = await productoDAO.listarProductos();
  return productos.filter(p => p.stock_minimo && p.stock_minimo < stock_minimo);
}

module.exports = {
  registrarProducto,
  listarProductos,
  buscarPorCodigo,
  buscarPorNombre,
  filtrarPorCategoria,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  cambiarEstadoProducto,
  obtenerProductosBajoStock
};