// client/models/index.js
const User = require('./User');
const Materia = require('./Materia');
const Evento = require('./Evento');

const { User, Materia, Evento } = require('./client/models/index');


// Definir la relación: Una materia tiene muchos eventos
Materia.hasMany(Evento, { foreignKey: 'materiaId', as: 'eventos' });
// Y cada evento pertenece a una materia
Evento.belongsTo(Materia, { foreignKey: 'materiaId', as: 'materia' });

module.exports = { User, Materia, Evento };
