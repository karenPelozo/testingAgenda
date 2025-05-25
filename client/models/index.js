// models/index.js
const User = require("./User");  // Modelo del usuario (no modificado)
const Materia = require("./Materia");
const Modalidad = require("./Modalidad");
const MateriaUsuario = require("./MateriaUsuario");
const Evento = require("./Evento");

// Asociaciones entre Usuario y MateriaUsuario (por inscripción)
User.hasMany(MateriaUsuario, { foreignKey: "idUsuario", as: "materiasInscritas" });
MateriaUsuario.belongsTo(User, { foreignKey: "idUsuario", as: "usuario" });

// Asociaciones entre Materia y MateriaUsuario
Materia.hasMany(MateriaUsuario, { foreignKey: "idMateria", as: "inscripciones" });
MateriaUsuario.belongsTo(Materia, { foreignKey: "idMateria", as: "materia" });

// Cada inscripción (MateriaUsuario) tiene muchos eventos
MateriaUsuario.hasMany(Evento, { foreignKey: "idMateriaUsuario", as: "eventos" });
Evento.belongsTo(MateriaUsuario, { foreignKey: "idMateriaUsuario", as: "inscripcion" });

// Relación entre Modalidad y Evento
Modalidad.hasMany(Evento, { foreignKey: "idModalidad", as: "eventos" });
Evento.belongsTo(Modalidad, { foreignKey: "idModalidad", as: "modalidad" });

module.exports = { User, Materia, Modalidad, MateriaUsuario, Evento };
