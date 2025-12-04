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
      
      // Inventory movement belongs to a warehouse
      MovimientoInventario.belongsTo(models.Almacen, {
        foreignKey: 'id_almacen',
        as: 'almacen'
      });
      
      // Inventory movement belongs to a location
      MovimientoInventario.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion',
        as: 'ubicacion'
      });
    }
  }
  MovimientoInventario.init({
    id_producto: DataTypes.INTEGER,
    tipo_movimiento: DataTypes.STRING,
    cantidad: DataTypes.FLOAT,
    motivo: DataTypes.STRING,
    id_usuario: DataTypes.INTEGER,
    fecha_movimiento: DataTypes.DATE,
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'pendiente'
    },
    id_almacen: DataTypes.INTEGER,
    id_ubicacion: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MovimientoInventario',
  });
  return MovimientoInventario;
};