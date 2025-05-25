'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TipoEvento extends Model {
   
    static associate(models) {
      // define association here
      TipoEvento.belongsTo(models.Evento,{
        foreignKey:'idEvento',
        as: 'Evento'
      })
      
    }
  }
  TipoEvento.init({
    idTipoEvento: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    nameTipoEvento: {
      type:DataTypes.STRING
    },
    idEvento:{
      type: DataTypes.INTEGER,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'TipoEvento',
    timestamps:false
  });
  return TipoEvento;
};