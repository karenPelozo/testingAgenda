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

    }
  }
  Correlativa.init({
    idCorrelativa:{
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    idMateria:{
      type :DataTypes.INTEGER,
      // preguntar si debo de referenciar a models.Materia references:{  model: 'Materia', key: 'id' }
      references:{  model: 'Materia', key: 'id' }
    },
    idMateriaCorrelativa: {
      type:DataTypes.INTEGER,
       // preguntar si debo de referenciar a models.Materia references:{  model: 'Materia', key: 'id' } y como lo puedo hacer aca
       
      }
  }, {
    sequelize,
    modelName: 'Correlativa',
  });
  return Correlativa;
};