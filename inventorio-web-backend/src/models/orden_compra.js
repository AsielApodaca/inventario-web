'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orden_Compra extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Purchase order belongs to a supplier
      Orden_Compra.belongsTo(models.Proveedor, {
        foreignKey: 'id_proveedor',
        as: 'proveedor'
      });
      
      // Purchase order belongs to a user
      Orden_Compra.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
      
      // A purchase order has many order details
      Orden_Compra.hasMany(models.Detalle_Orden_Compra, {
        foreignKey: 'id_orden',
        as: 'detalles'
      });
    }
  }
  Orden_Compra.init({
    id_proveedor: DataTypes.INTEGER,
    fecha_orden: DataTypes.DATE,
    estado: DataTypes.STRING,
    total: DataTypes.FLOAT,
    id_usuario: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Orden_Compra',
  });
  return Orden_Compra;
};