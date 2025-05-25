'use strict';
const { allow } = require('joi');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EstadoEvento extends Model {
   
    static associate(models) {
      // define association here
      EstadoEvento.belongsTo(models.Evento,{
        foreignKey: 'idEvento',
        as: 'Evento'
      })
    }
  }
  EstadoEvento.init({
    idEstadoEvento: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    nameEstadoEvento:{
      type:  DataTypes.STRING // en curso, terminado, sin hacer
    },
   
  }, {
    sequelize,
    modelName: 'EstadoEvento',
    timestamps: false
  });
  return EstadoEvento;
};