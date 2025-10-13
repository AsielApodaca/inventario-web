'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A user has many inventory movements
      Usuario.hasMany(models.MovimientoInventario, {
        foreignKey: 'id_usuario',
        as: 'movimientosInventario'
      });
      
      // A user has many purchase orders
      Usuario.hasMany(models.Orden_Compra, {
        foreignKey: 'id_usuario',
        as: 'ordenesCompra'
      });
    }
  }
  Usuario.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    rol: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};