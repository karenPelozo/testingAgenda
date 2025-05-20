'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Eventos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idEvento: {
        type: Sequelize.INTEGER
      },
      numero: {
        type: Sequelize.INTEGER
      },
      temasAestudiar: {
        type: Sequelize.STRING
      },
      fecha: {
        type: Sequelize.DATE
      },
      idMateria: {
        type: Sequelize.INTEGER
      },
      idTipoEvento: {
        type: Sequelize.INTEGER
      },
      idEstadoEvento: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Eventos');
  }
};