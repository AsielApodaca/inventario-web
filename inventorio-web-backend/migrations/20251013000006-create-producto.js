'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo_barras: {
        type: Sequelize.STRING,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING
      },
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Categoria', // Nombre correcto de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_proveedor: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Proveedors', // Sequelize pluraliza automáticamente
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      precio_compra: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      precio_venta: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      stock_minimo: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      stock_maximo: {
        type: Sequelize.FLOAT,
        defaultValue: 0
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