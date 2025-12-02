'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orden_Compras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_proveedor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {

          model: 'Proveedors',
          key: 'id'

        }
      },
      fecha_orden: {
        type: Sequelize.DATE
      },
      estado: {
        type: Sequelize.STRING
      },
      total: {
        type: Sequelize.FLOAT
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {

          model: 'Usuarios',
          key: 'id'

        }
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
    await queryInterface.dropTable('Orden_Compras');
  }
};