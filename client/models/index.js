// models/index.js
const User = require("./User"); // No lo modificamos
const Materia = require("./Materia");
const MateriaUsuario = require("./MateriaUsuario");
const Evento = require("./Evento");

// Un usuario puede estar inscrito en muchas materias
User.hasMany(MateriaUsuario, { foreignKey: "idUsuario", as: "materiasInscritas" });
MateriaUsuario.belongsTo(User, { foreignKey: "idUsuario", as: "usuario" });

// Una materia global puede tener muchas inscripciones (muchos alumnos cursándola)
Materia.hasMany(MateriaUsuario, { foreignKey: "idMateria", as: "inscripciones" });
MateriaUsuario.belongsTo(Materia, { foreignKey: "idMateria", as: "materia" });

// Cada inscripción (MateriaUsuario) tendrá muchos eventos propios
MateriaUsuario.hasMany(Evento, { foreignKey: "idMateriaUsuario", as: "eventos" });
Evento.belongsTo(MateriaUsuario, { foreignKey: "idMateriaUsuario", as: "inscripcion" });

module.exports = { User, Materia, MateriaUsuario, Evento };
