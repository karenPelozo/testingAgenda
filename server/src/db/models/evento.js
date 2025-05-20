'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Evento extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Evento.belongsTo(models.Materia, {
        foreignKey: 'idEvento', as: 'Materia'
      });

      Evento.hasOne(models.TipoEvento,{
        foreignKey:'idEvento'
      })
      Evento.hasOne(models.Resultado,{
        foreignKey: 'idEvento'
      })
      Evento.hasOne(models.EstadoEvento,{
        foreignKey:'idEvento'
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
      type:DataTypes.DATE
    },
    idMateria:{
      type: DataTypes.INTEGER,
       references: {
              model: 'Materias', // nombre de la tabla
              key: 'id',
        },
      allowNull:false
    },
    idTipoEvento: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    idEstadoEvento:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    idResultado:{
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Evento',
    tableName: 'Eventos'
  });
  return Evento;
};