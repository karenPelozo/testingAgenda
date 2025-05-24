// client/models/Evento.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Data/db');

const Evento = sequelize.define('Evento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  temasAEstudiar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaEntrega: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // La clave foránea 'materiaId' se agregará mediante la asociación
}, {
  tableName: 'eventos',
  timestamps: false,
});

module.exports = Evento;
