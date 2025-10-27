'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Product belongs to a category
      Producto.belongsTo(models.Categoria, {
        foreignKey: 'id_categoria',
        as: 'categoria'
      });
      
      // Product belongs to a supplier
      Producto.belongsTo(models.Proveedor, {
        foreignKey: 'id_proveedor',
        as: 'proveedor'
      });
      
      // A product has many inventory records
      Producto.hasMany(models.Inventario, {
        foreignKey: 'id_producto',
        as: 'inventarios'
      });
      
      // A product has many inventory movements
      Producto.hasMany(models.MovimientoInventario, {
        foreignKey: 'id_producto',
        as: 'movimientosInventario'
      });
      
      // A product has many order details
      Producto.hasMany(models.Detalle_Orden_Compra, {
        foreignKey: 'id_producto',
        as: 'detallesOrdenCompra'
      });
    }
  }
  Producto.init({
    codigo_barras: DataTypes.STRING,
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    id_categoria: DataTypes.INTEGER,
    id_proveedor: DataTypes.INTEGER,
    precio_compra: DataTypes.FLOAT,
    precio_venta: DataTypes.FLOAT,
    stock_minimo: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'Producto',
  });
  return Producto;
};