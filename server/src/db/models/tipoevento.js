'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TipoEvento extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TipoEvento.belongsTo(models.Evento,{
        foreignKey:'idTipoEvento'
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
  });
  return TipoEvento;
};