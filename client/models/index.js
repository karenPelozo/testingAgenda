// client/models/index.js
const User = require('./User');
const Materia = require('./Materia');
const Evento = require('./Evento');

// Cada Usuario tiene muchas Materias.
User.hasMany(Materia, { foreignKey: 'userId' });
Materia.belongsTo(User, { foreignKey: 'userId' });

// Cada Materia tiene muchos Eventos.
Materia.hasMany(Evento, { foreignKey: 'materiaId', as: 'eventos' });
Evento.belongsTo(Materia, { foreignKey: 'materiaId', as: 'materia' });

module.exports = { User, Materia, Evento };
