'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   up: async (queryInterface, Sequelize)=> {
    const hashedPassword = bcrypt.hash('admin',10)
    await queryInterface.bulkInsert('User',[{
        nameuser:'admin',
        passworduser: hashedPassword,
        roluser:'administrador',
        createdAt: new Date(),
        updatedAt: new Date(),
    }])
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

 down: async (queryInterface, Sequelize) =>{
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
