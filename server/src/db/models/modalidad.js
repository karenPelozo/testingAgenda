'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Modalidad extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Modalidad.belongsTo(models.Materia, {
        foreignKey:'idMateria'
      })
    }
  }
  Modalidad.init({
    idModalidad:{
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    nameModalidad: {
      type: DataTypes.STRING,
      allowNull:false,
    }
  }, {
    sequelize,
    modelName: 'Modalidad',
    timestamps:false
  });
  return Modalidad;
};