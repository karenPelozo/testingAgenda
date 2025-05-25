const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const User = sequelize.define("User", {
  id: {  // La clave primaria del usuario
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: "usuarios",
  timestamps: false,
});

module.exports = User;
