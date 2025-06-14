// client/src/server/controllers/estadisticas.controller.js
const { MateriaUsuario, Evento } = require("../../../models/index"); 
// Ajusta la ruta si tu index.js de modelos está en otro lugar

async function getEstadisticas(req, res) {
  try {
    const userId = req.user.id;  // viene de auth.js

    // 1) Traer inscripciones + eventos de este usuario
    const inscripciones = await MateriaUsuario.findAll({
      where: { idUsuario: userId },
      include: [{ model: Evento, as: "eventos" }]
    });

    // 2) Calcular métricas
    const totalMaterias      = inscripciones.length;
    let materiasAprobadas    = 0;
    let materiasPendientes   = 0;
    let sumNotas = 0, countNotas = 0;

    for (const ins of inscripciones) {
      const ev = ins.eventos[0]; 
      if (!ev) {
        materiasPendientes++;
        continue;
      }
      const nf = parseInt(ev.notaFinal, 10);
      if (isNaN(nf)) {
        materiasPendientes++;
      } else {
        materiasAprobadas++;
        sumNotas += nf;
        countNotas++;
      }
    }

    const promedioGeneral = 
      countNotas > 0
        ? (sumNotas / countNotas).toFixed(2)
        : "0.00";

    // 3) Responder JSON
    res.json({ totalMaterias, materiasAprobadas, materiasPendientes, promedioGeneral });
  } catch (err) {
    console.error("Error en getEstadisticas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { getEstadisticas };
