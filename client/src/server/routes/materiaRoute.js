const { Router } = require('express');
const routerMateria = Router();
const controllerMateria = require('../controllers/materiaController');

routerMateria.get("/",estaAutentificado,controllerMateria.getMaterias);
routerMateria.get("/:id",existeMateria,controllerMateria.getByIdMaterias);