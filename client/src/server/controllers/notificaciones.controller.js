// controllers/eventoController.js
const moment = require("moment");
const { Evento } = require("../../../models/index");

async function getEventosProximos(req, res) {
  try {
    const eventos = await Evento.findAll();

    console.log('Eventos totales:', eventos.length);
    eventos.forEach(e => {
      console.log(`Evento ID: ${e.id}, fechaEntrega: ${e.fechaEntrega}, fechaExamen: ${e.fechaExamen}`);
    });

    const obtenerEventosProximos = (eventos, diasAntes = 3) => {
      const hoy = moment().startOf('day');
      return eventos.filter(evento => {
        const fecha = evento.fechaEntrega || evento.fechaExamen;
        if (!fecha) return false;

        const fechaEvento = moment(fecha).startOf('day'); // comparar solo la fecha sin horas
        const diferenciaDias = fechaEvento.diff(hoy, 'days');

        console.log(`Evento ID ${evento.id}: fechaEvento=${fechaEvento.format('YYYY-MM-DD')}, diferenciaDias=${diferenciaDias}`);

        return diferenciaDias >= 0 && diferenciaDias <= diasAntes;
      });
    };

    const proximos = obtenerEventosProximos(eventos, 3);
    console.log('Eventos próximos encontrados:', proximos.length);

    res.json(proximos);

  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { getEventosProximos };