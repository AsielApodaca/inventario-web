'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Detalle_Orden_Compras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {

          model: 'Orden_Compras',
          key: 'id'

        }
      },
      id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {

          model: 'Productos',
          key: 'id'

        }
      },
      cantidad: {
        type: Sequelize.FLOAT
      },
      precio_unitario: {
        type: Sequelize.FLOAT
      },
      subtotal: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('Detalle_Orden_Compras');
  }
};