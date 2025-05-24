// models/MateriaUsuario.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const MateriaUsuario = sequelize.define("MateriaUsuario", {
  idMateriaUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idMateria: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
  // Puedes agregar otros campos aquí (ej., fecha de inscripción)
}, {
  tableName: "materias_usuarios",
  timestamps: false,
});

module.exports = MateriaUsuario;
