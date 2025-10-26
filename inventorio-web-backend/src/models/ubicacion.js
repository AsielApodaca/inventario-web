'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ubicacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Location belongs to a warehouse
      Ubicacion.belongsTo(models.Almacen, {
        foreignKey: 'id_almacen',
        as: 'almacen'
      });
      
      // A location has many inventory records
      Ubicacion.hasMany(models.Inventario, {
        foreignKey: 'id_ubicacion',
        as: 'inventarios'
      });
    }
  }
  Ubicacion.init({
    id_almacen: DataTypes.INTEGER,
    pasillo: DataTypes.STRING,
    estante: DataTypes.STRING,
    nivel: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ubicacion',
  });
  return Ubicacion;
};