const User = require("./User");
const Materia = require("./Materia");
const Modalidad = require("./Modalidad");
const MateriaUsuario = require("./MateriaUsuario");
const Evento = require("./Evento");

// Relación: Un usuario tiene muchas inscripciones
User.hasMany(MateriaUsuario, { foreignKey: "idUsuario", as: "materiasInscritas" });
MateriaUsuario.belongsTo(User, { foreignKey: "idUsuario", as: "usuario" });

// Relación: Una materia tiene muchas inscripciones
Materia.hasMany(MateriaUsuario, { foreignKey: "idMateria", as: "inscripciones" });
MateriaUsuario.belongsTo(Materia, { foreignKey: "idMateria", as: "materia" });

// Relación: Una inscripción (MateriaUsuario) tiene muchos eventos
MateriaUsuario.hasMany(Evento, { foreignKey: "idMateriaUsuario", as: "eventos" });
Evento.belongsTo(MateriaUsuario, { foreignKey: "idMateriaUsuario", as: "inscripcion" });

// Relación: Una modalidad tiene muchos eventos
Modalidad.hasMany(Evento, { foreignKey: "idModalidad", as: "eventos" });
Evento.belongsTo(Modalidad, { foreignKey: "idModalidad", as: "modalidad" });

module.exports = {
  User,
  Materia,
  Modalidad,
  MateriaUsuario,
  Evento
};
