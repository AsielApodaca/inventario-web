'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ubicacions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_almacen: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {

          model: 'Almacens',
          key: 'id'

        }
      },
      pasillo: {
        type: Sequelize.STRING
      },
      estante: {
        type: Sequelize.STRING
      },
      nivel: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Ubicacions');
  }
};