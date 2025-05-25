'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Correlativa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Correlativa.belongsToMany(models.Materia,{
        through: 'MateriaCorrelativa'
      })
    }
  }
  Correlativa.init({
    idCorrelativa:{
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    nameCorrelativa:{
      type:DataTypes.STRING,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Correlativa',
    timestamps:false
  });
  return Correlativa;
};