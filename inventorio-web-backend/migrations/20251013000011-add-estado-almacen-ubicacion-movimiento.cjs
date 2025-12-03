'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('MovimientoInventarios', 'estado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pendiente'
    });

    await queryInterface.addColumn('MovimientoInventarios', 'id_almacen', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Almacens',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('MovimientoInventarios', 'id_ubicacion', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Ubicacions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('MovimientoInventarios', 'estado');
    await queryInterface.removeColumn('MovimientoInventarios', 'id_almacen');
    await queryInterface.removeColumn('MovimientoInventarios', 'id_ubicacion');
  }
};

