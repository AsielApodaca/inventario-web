'use strict';
import {Model} from 'sequelize';

export default (sequelize, DataTypes) => {
  class Categoria extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Self-referential relationship for category hierarchy
      Categoria.hasMany(models.Categoria, {
        as: 'subcategorias',
        foreignKey: 'id_categoria_padre'
      });
      Categoria.belongsTo(models.Categoria, {
        as: 'categoriaPadre',
        foreignKey: 'id_categoria_padre'
      });
      
      // A category has many products
      Categoria.hasMany(models.Producto, {
        foreignKey: 'id_categoria',
        as: 'productos'
      });
    }
  }
  Categoria.init({
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    id_categoria_padre: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Categoria',
  });
  return Categoria;
};