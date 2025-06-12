const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const Materia = sequelize.define(
  "Materia",
  {
    idMateria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    NombreMateria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("Vigente", "No Vigente"),
      allowNull: false,
      defaultValue: "Vigente",
    },
  },
  {
    tableName: "materias",
    timestamps: false,
  }
);

module.exports = Materia;
