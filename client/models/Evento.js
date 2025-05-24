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
    type: DataTypes.DATE,
    allowNull: true,
  },
  idMateriaUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: "eventos",
  timestamps: false,
});

module.exports = Evento;
