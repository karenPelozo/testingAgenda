'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Resultado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Resultado.belongsTo(models.Evento,{
        foreignKey:'idResultado'
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
    idEvento:{
      type:DataTypes.INTEGER,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Resultado',
  });
  return Resultado;
};