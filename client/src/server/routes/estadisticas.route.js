// client/src/server/routes/estadisticas.route.js
const router = require("express").Router();
const { getEstadisticas } = require("../controllers/estadisticas.controller");
const authenticateToken  = require("../middleware/auth");

router.get("/", authenticateToken, getEstadisticas);

module.exports = router;
