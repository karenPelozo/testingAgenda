'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Materia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idMateria: {
        type: Sequelize.INTEGER
      },
      nameMateria: {
        type: Sequelize.STRING
      },
      anioDeCarrera: {
        type: Sequelize.INTEGER
      },
      horario: {
        type: Sequelize.STRING
      },
      anioAcademico: {
        type: Sequelize.INTEGER
      },
      idModalidad: {
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
    await queryInterface.dropTable('Materia');
  }
};