'use strict';
import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('Usuarios', [{
      username: 'admin',
      password: hashedPassword,
      rol: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    console.log('✅ Usuario admin creado: admin / admin123');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', { username: 'admin' }, {});
  }
};