// models/Evento.js
/*const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const Evento = sequelize.define("Evento", {
  idEvento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  anioDeCarrera: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  horaFin: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  correlativas: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fechaExamen: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notaParcial1: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  notaParcial2: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  notaFinal: {
    type: DataTypes.VIRTUAL,
  get() {
    const nota1 = this.notaParcial1;
    const nota2 = this.notaParcial2;

    if (nota1 == null || nota2 == null) return null;

    const promedio = (nota1 + nota2) / 2;
    return Math.ceil(promedio);
  }
  },
  idModalidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  idMateriaUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Campos adicionales para la información dinámica
  numero: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  temasAEstudiar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fechaEntrega: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dia: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: "eventos",
  timestamps: false,
});


module.exports = Evento;
*/

// models/Evento.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Data/db");

const Evento = sequelize.define("Evento", {
  idEvento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: { type: DataTypes.STRING, allowNull: false },
  anioDeCarrera: { type: DataTypes.INTEGER, allowNull: true },
  anio:         { type: DataTypes.INTEGER, allowNull: true },
  horaInicio:   { type: DataTypes.TIME,    allowNull: true },
  horaFin:      { type: DataTypes.TIME,    allowNull: true },
  correlativas: { type: DataTypes.STRING,  allowNull: true },
  fechaExamen:  { type: DataTypes.DATEONLY,allowNull: true },
  notaParcial1: { type: DataTypes.FLOAT,   allowNull: true },
  notaParcial2: { type: DataTypes.FLOAT,   allowNull: true },


notaFinal: {
  type: DataTypes.STRING,
  allowNull: true
},

  idModalidad:      { type: DataTypes.INTEGER, allowNull: true },
  idMateriaUsuario: { type: DataTypes.INTEGER, allowNull: false },
  numero:           { type: DataTypes.INTEGER, allowNull: true },
  temasAEstudiar:   { type: DataTypes.TEXT,    allowNull: true },
  estado:           { type: DataTypes.STRING,  allowNull: true },
  fechaEntrega:     { type: DataTypes.DATEONLY,allowNull: true },
  dia:              { type: DataTypes.STRING,  allowNull: true }
}, {
  tableName: "eventos",
  timestamps: false,

  // HOOK: antes de guardar o actualizar, calcula notaFinal
  hooks: {
    beforeSave: (evento) => {
      const n1 = evento.notaParcial1;
      const n2 = evento.notaParcial2;

      // si faltan parciales
      if (n1 == null || n2 == null) {
        evento.notaFinal = null;
        return;
      }

      // si alguno <7: "Debe recuperar"
      if (n1 < 7 || n2 < 7) {
        evento.notaFinal = "Debe recuperar";
      } else {
        // promedio y ceil
        const prom = Math.ceil((n1 + n2) / 2);
        evento.notaFinal = String(prom);
      }
    }
  }
});

module.exports = Evento;
