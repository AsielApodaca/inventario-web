'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Detalle_Orden_Compra extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Order detail belongs to a purchase order
      Detalle_Orden_Compra.belongsTo(models.Orden_Compra, {
        foreignKey: 'id_orden',
        as: 'ordenCompra'
      });
      
      // Order detail belongs to a product
      Detalle_Orden_Compra.belongsTo(models.Producto, {
        foreignKey: 'id_producto',
        as: 'producto'
      });
    }
  }
  Detalle_Orden_Compra.init({
    id_orden: DataTypes.INTEGER,
    id_producto: DataTypes.INTEGER,
    cantidad: DataTypes.FLOAT,
    precio_unitario: DataTypes.FLOAT,
    subtotal: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Detalle_Orden_Compra',
  });
  return Detalle_Orden_Compra;
};