'use strict';
import {Model} from 'sequelize';

export default (sequelize, DataTypes) => {
  class Proveedor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A supplier has many products
      Proveedor.hasMany(models.Producto, {
        foreignKey: 'id_proveedor',
        as: 'productos'
      });
      
      // A supplier has many purchase orders
      Proveedor.hasMany(models.Orden_Compra, {
        foreignKey: 'id_proveedor',
        as: 'ordenesCompra'
      });
    }
  }
  Proveedor.init({
    nombre: DataTypes.STRING,
    telefono: DataTypes.STRING,
    email: DataTypes.STRING,
    direccion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Proveedor',
  });
  return Proveedor;
};