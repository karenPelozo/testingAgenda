const { Router } = require('express');
const notificacionesRoute= Router();
const notificacionesController = require('../controllers/notificaciones.controller.js');

notificacionesRoute.get("/",notificacionesController.getEventosProximos);

module.exports = notificacionesRoute;