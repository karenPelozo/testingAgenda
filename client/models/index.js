// models/index.js
const User = require("./User"); // No modificamos el modelo de usuario
const Materia = require("./Materia");
const MateriaUsuario = require("./MateriaUsuario");
const Evento = require("./Evento");
const Modalidad = require("./Modalidad");

// Asociaciones entre Usuario y MateriaUsuario:
User.hasMany(MateriaUsuario, { foreignKey: "idUsuario", as: "materiasInscritas" });
MateriaUsuario.belongsTo(User, { foreignKey: "idUsuario", as: "usuario" });

// Asociaciones entre Materia y MateriaUsuario:
Materia.hasMany(MateriaUsuario, { foreignKey: "idMateria", as: "inscripciones" });
MateriaUsuario.belongsTo(Materia, { foreignKey: "idMateria", as: "materia" });

// Asociación entre MateriaUsuario y Evento:
MateriaUsuario.hasMany(Evento, { foreignKey: "idMateriaUsuario", as: "eventos" });
Evento.belongsTo(MateriaUsuario, { foreignKey: "idMateriaUsuario", as: "inscripcion" });

// Asociación entre Evento y Modalidad:
Modalidad.hasMany(Evento, { foreignKey: "idModalidad", as: "eventos" });
Evento.belongsTo(Modalidad, { foreignKey: "idModalidad", as: "modalidad" });

module.exports = { User, Materia, MateriaUsuario, Evento, Modalidad };
