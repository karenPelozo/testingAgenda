// models/MateriaCorrelativa.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");
const Materia = require("./Materia");

const MateriaCorrelativa = sequelize.define("MateriaCorrelativa", {
  idMateria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Materia,
      key: "idMateria"
    }
  },
  idCorrelativa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Materia,
      key: "idMateria"
    }
  }
}, {
  tableName: "materia_correlativa",
  timestamps: false
});

module.exports = MateriaCorrelativa;
