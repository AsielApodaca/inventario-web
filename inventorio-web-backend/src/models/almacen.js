'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Almacen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A warehouse has many locations
      Almacen.hasMany(models.Ubicacion, {
        foreignKey: 'id_almacen',
        as: 'ubicaciones'
      });
    }
  }
  Almacen.init({
    nombre: DataTypes.STRING,
    direccion: DataTypes.STRING,
    responsable: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Almacen',
  });
  return Almacen;
};