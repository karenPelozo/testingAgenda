'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Materia extends Model {
    static associate(models) {
      // define association here
      //ASOCIACION CON MODALIDAD  UNO A UNO 
      Materia.hasOne(models.Modalidad, { 
        foreignKey: 'idMateria'
       });
      //ASOCIACION CON EVENTOS UNO A UNO 
      Materia.hasMany(models.Evento, { 
        foreignKey: 'idMateria'
       });
      //ASOCIACION CON CORRELATIVAS
      Materia.hasMany(models.Correlativa, {
        foreignKey:'idMateria'
      })
     Materia.belongsToMany(models.Correlativa,{
        through: 'MateriaCorrelativa'
        })
      //ASOCIACION MATERIA USUARIO
      Materia.belongsToMany(models.User,{
        through: 'MateriaUser'
            })
    }
    
  }
   //ACA IBA EL PROMEDIO, LA FUNCIO PROMEDIO NO ME FUNCIONO...
  
  Materia.init({
    idMateria: {
      type: DataTypes.INTEGER,
      unique:true,
      primaryKey:true,
      allowNull:false,
      autoIncrement: true
    },
    nameMateria:{
      type: DataTypes.STRING,
      allowNull:false
    },
    anioDeCarrera:{
      type:DataTypes.INTEGER
    } ,
    horario:{
      type:DataTypes.STRING,
      allowNull:false
    },
    anioAcademico:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
  
  }, {
    sequelize,
    modelName: 'Materia',
    timestamps:false
  });
  
  return Materia;
};