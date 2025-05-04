const { Router } = require('express');
const routerMateria = Router();
const controllerMateria = require('../controllers/materiaController');
import { estaAutentificado,existeMateria } from '../middleware/materiasMiddleware';

routerMateria.get("/",estaAutentificado,controllerMateria.getMaterias);
routerMateria.get("/:id",existeMateria,controllerMateria.getByIdMaterias);