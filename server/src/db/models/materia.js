'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Materia extends Model {
    static associate(models) {
      // define association here
      //ASOCIACION CON MODALIDAD  UNO A UNO 
      Materia.hasOne(models.Modalidad, { foreignKey: 'idMateria', as: 'Modalidad' });
      //ASOCIACION CON EVENTOS UNO A UNO 
      Materia.hasMany(models.Evento, { foreignKey: 'idMateria', as: 'Eventos' });
      //ASOCIACION CON CORRELATIVAS
      Materia.hasMany(models.Correlativa, {
        foreignKey:'idMateria', as: 'Correlativas'
      })
     Materia.belongsTo(models.Correlativa,{
        foreignKey: 'idMateriaCorrelativa',
         as: 'CorrelativaDe'
        })
      //ASOCIACION MATERIA USUARIO
      Materia.belongsToMany(models.User,{
        through: 'MateriaUser',
        foreignKey:'idMateria',
        otherKey: 'idUser'
      })
    }
  }
   //este el promeido de clara
  
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
    idModalidad:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    idEvento:{
      type:DataTypes.INTEGER,
      allowNull:true
    }
  }, {
    sequelize,
    modelName: 'Materia',
    tableName: 'Materias'
  });
  return Materia;
};