'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo_barras: {
        type: Sequelize.STRING
      },
      nombre: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.STRING
      },
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {

          model: 'Categoria',
          key: 'id'

        }

      },
      id_proveedor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {

          model: 'Proveedors',
          key: 'id'

        }
      },
      precio_compra: {
        type: Sequelize.FLOAT
      },
      precio_venta: {
        type: Sequelize.FLOAT
      },
      stock_minimo: {
        type: Sequelize.FLOAT
      },
      stock_maximo: {
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
    await queryInterface.dropTable('Productos');
  }
};