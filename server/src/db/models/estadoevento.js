'use strict';
const { allow } = require('joi');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EstadoEvento extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EstadoEvento.belongsTo(models.Evento,{
        foreignKey: 'idEstadoEvento'
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
      type:  DataTypes.STRING
    },
    idEvento:{
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'EstadoEvento',
  });
  return EstadoEvento;
};