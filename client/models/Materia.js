// client/models/Materia.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Data/db');

const Materia = sequelize.define('Materia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  anioDeCarrera: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  anio: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  horario: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  modalidad: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  correlativas: {
    type: DataTypes.JSON, // Se almacenará como JSON (SQLite lo guardará como TEXT)
    allowNull: true,
  },
  notaParcial1: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  notaParcial2: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  notaFinal: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // La clave foránea 'userId' se agregará mediante la asociación
}, {
  tableName: 'materias',
  timestamps: false,
});

module.exports = Materia;
