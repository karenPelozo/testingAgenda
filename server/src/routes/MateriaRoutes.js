const express= require('express');
const router = express.Router();
const controllerMateria = require('../controllers/MateriaControllers')
const {schemaValido,existeMateria}= require('../middlewares/MateriaMiddleware')
//get materias
router.get('/' ,controllerMateria.getMaterias)
//getById materias
router.get('/:id', existeMateria, controllerMateria.getByIdMaterias)
//create post materias
router.post('/', existeMateria,schemaValido,controllerMateria.createMateria)
//delete materias
router.delete('/:id',existeMateria,controllerMateria.deleteMateria)
//deleteAll materias
router.delete('/',controllerMateria.deleteAll)
//update put materias
router.put('/:id',existeMateria,controllerMateria.updateMateria)

module.exports = router;