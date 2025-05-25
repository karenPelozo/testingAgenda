'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Resultado extends Model {
    
    static associate(models) {
      // define association here
      Resultado.belongsTo(models.Evento,{
        foreignKey:'idEvento',
        as: 'Evento'
      })
    }
  }
  Resultado.init({
    idResultado: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    nota:{
      type: DataTypes.DECIMAL
    },

  }, {
    sequelize,
    modelName: 'Resultado',
    timestamps:false
  });
  return Resultado;
};