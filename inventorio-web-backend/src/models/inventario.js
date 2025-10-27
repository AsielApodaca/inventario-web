'use strict';
import {Model} from 'sequelize';

export default (sequelize, DataTypes) => {
  class Inventario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Inventory belongs to a product
      Inventario.belongsTo(models.Producto, {
        foreignKey: 'id_producto',
        as: 'producto'
      });
      
      // Inventory belongs to a location
      Inventario.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion',
        as: 'ubicacion'
      });
    }
  }
  Inventario.init({
    id_producto: DataTypes.INTEGER,
    id_ubicacion: DataTypes.INTEGER,
    cantidad: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Inventario',
  });
  return Inventario;
};