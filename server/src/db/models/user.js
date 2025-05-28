'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Materia, {
        through: 'MateriaUser',
        foreignKey: 'idUser',
        otherKey: 'idMateria'
      })
    }
  }
  User.init({
    iduser:{
      type:DataTypes.INTEGER,
      unique:true,
      primaryKey: true,
      allowNull : false,
      autoIncrement: true
    } ,
    nameuser:{
      type:DataTypes.STRING,
      allowNull: false
    } ,
    passworduser:{
      type:DataTypes.STRING,
      allowNull:false
    } ,
    roluser: {
      type:DataTypes.STRING,

      defaultValue:'User'
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps:false
  });
  return User;
};