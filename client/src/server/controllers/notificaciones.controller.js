// controllers/notificaciones.controller.js
const moment = require("moment");
const { Evento, MateriaUsuario } = require("../../../models/index");

async function getEventosProximos(req, res) {
  try {
    const userId = req.user.id; // viene de authenticateToken

    // 1) Obtengo SOLO los eventos de las inscripciones de este usuario
    const eventos = await Evento.findAll({
      include: [{
        model: MateriaUsuario,
        as: "inscripcion",     // Asegurate que en tu modelo Evento tienes esta asociación:
        where: { idUsuario: userId }
      }]
    });

    console.log("Eventos de este usuario:", eventos.length);
    eventos.forEach(e => {
      console.log(
        `Evento ID: ${e.idEvento}, fechaEntrega: ${e.fechaEntrega}, fechaExamen: ${e.fechaExamen}`
      );
    });

    // 2) Filtro por próximos 3 días
    const proximos = eventos.filter(ev => {
      const fechaRaw = ev.fechaEntrega || ev.fechaExamen;
      if (!fechaRaw) return false;

      const hoy = moment().startOf("day");
      const fechaEv = moment(fechaRaw).startOf("day");
      const diff = fechaEv.diff(hoy, "days");
      console.log(
        `Evento ID ${ev.idEvento}: fechaEv=${fechaEv.format("YYYY-MM-DD")}, diff=${diff}`
      );
      return diff >= 0 && diff <= 3;
    });

    console.log("Eventos próximos encontrados:", proximos.length);
    return res.json(proximos);

  } catch (error) {
    console.error("Error en getEventosProximos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { getEventosProximos };
