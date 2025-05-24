// models/Modalidad.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const Modalidad = sequelize.define("Modalidad", {
  idModalidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: "modalidades",
  timestamps: false,
});

module.exports = Modalidad;
