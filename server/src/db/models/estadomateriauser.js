'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EstadoMateriaUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EstadoMateriaUser.belongsTo(models.MateriaUser,{
        foreignKey:'idMateriaUser'
      })
    }
  }
  EstadoMateriaUser.init({
    idEstadoMateriaUser:{
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    estado:{
      type:DataTypes.STRING,
      allowNull: false
    },
    
  }, {
    sequelize,
    modelName: 'EstadoMateriaUser',
    timestamps:false
  });
  return EstadoMateriaUser;
};