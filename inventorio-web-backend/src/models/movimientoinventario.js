'use strict';
import {Model} from 'sequelize';

export default (sequelize, DataTypes) => {
  class MovimientoInventario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Inventory movement belongs to a product
      MovimientoInventario.belongsTo(models.Producto, {
        foreignKey: 'id_producto',
        as: 'producto'
      });
      
      // Inventory movement belongs to a user
      MovimientoInventario.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
    }
  }
  MovimientoInventario.init({
    id_producto: DataTypes.INTEGER,
    tipo_movimiento: DataTypes.STRING,
    motivo: DataTypes.STRING,
    id_usuario: DataTypes.INTEGER,
    fecha_movimiento: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'MovimientoInventario',
  });
  return MovimientoInventario;
};