'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize){
   try {
     const hashedPassword = await bcrypt.hash('admin',10)
    await queryInterface.bulkInsert('Users',[{
        nameuser:'admin',
        passworduser: hashedPassword,
        roluser:'administrador',
        createdAt: new Date(),
        updatedAt: new Date()
        
    }])
   } catch (error) {
     console.error('Error al ejecutar el seed bombom',error);
     throw error;
   }
      /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

 async down(queryInterface, Sequelize){
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
