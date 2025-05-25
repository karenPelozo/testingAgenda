'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MateriaUser extends Model {
  
    static associate(models) {
     MateriaUser.hasMany(models.EstadoMateriaUser,{
      foreignKey:'idMateriaUser'
     })
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
  
  }, {
    sequelize,
    modelName: 'MateriaUser',
    tableName: 'MateriasUsers',
    timestamps:false
  });
  return MateriaUser;
};