// models/Evento.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const Evento = sequelize.define("Evento", {
  idEvento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  anioDeCarrera: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  horaFin: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  correlativas: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fechaExamen: {
    type: DataTypes.DATEONLY,
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
  idModalidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  idMateriaUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Campos adicionales para la información dinámica
  numero: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  temasAEstudiar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fechaEntrega: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dia: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: "eventos",
  timestamps: false,
});

module.exports = Evento;
