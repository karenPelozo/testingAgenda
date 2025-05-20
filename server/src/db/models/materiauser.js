'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MateriaUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //
      //ASOCIAR MATERIAUSUARIO CON ESTADOMATERIAUSUARIO UNO A UNO
      
    }
  }
  MateriaUser.init({
    idRelacion:{
      type: DataTypes.INTEGER,
      primaryKey:true,
      allowNull:false,
      autoIncrement: true,
      unique:true
    },
    idUser: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    idMateria:{
      type:DataTypes.INTEGER,
      allowNull:false,
      references: {
        model: 'Materia',
        key: 'id'
      }
    },
    fechaAprobacion: {
      type:DataTypes.DATE
    },
    idEstadoRelacion: {
      type:DataTypes.INTEGER,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'MateriaUser',
    tableName: 'MateriasUsers'
  });
  return MateriaUser;
};