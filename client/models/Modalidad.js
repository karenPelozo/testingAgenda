const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const Modalidad = sequelize.define("Modalidad", {
  idModalidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipoModalidad: {  // Podés usar "Nombre" si lo preferís, pero aquí se llama "tipoModalidad"
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: "modalidades",
  timestamps: false,
});

module.exports = Modalidad;
