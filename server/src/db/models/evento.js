'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Evento extends Model {
   
    static associate(models) {
      // define association here
      Evento.belongsTo(models.Materia, {
        foreignKey: 'idMateria'
      });

      Evento.hasOne(models.TipoEvento,{
        foreignKey:'idEvento',
        as: 'TipoEvento'
      })
      Evento.hasOne(models.Resultado,{
        foreignKey: 'idEvento' ,
        as : 'Nota'
      })
      Evento.hasOne(models.EstadoEvento,{
        foreignKey:'idEvento',
        as:'EstadoEvento'
      })
    }
  }
  Evento.init({
    idEvento:{
      type: DataTypes.INTEGER,
      primaryKey:true,
      unique:true,
      allowNull:false
    },
    numero: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    temasAestudiar:{
      type: DataTypes.STRING
    } ,
    fecha:{
      type:DataTypes.DATE,
      allowNull:true
    },
     
  }, {
    sequelize,
    modelName: 'Evento',
    tableName: 'Eventos',
    timestamps:false
  });
  return Evento;
};