const express= require('express');
const router = express.Router();
const controllerUser = require('../controllers/UserControllers')
//const {schemaValido,existeMateria}= require('../middlewares/MateriaMiddleware')
//get Usuarios
router.get('/' ,controllerUser.getUser)
//getById Usuarios
router.get('/:id',controllerUser.getByIdUser)
//create post 
router.post('/',controllerUser.createUser)
//delete materias
router.delete('/:id',controllerUser.deleteUser)
//deleteAll materias
router.delete('/',controllerUser.deleteAllUsers)
//update put materias
router.put('/:id',controllerUser.updateUser);
//ACA PONER UNA RUTA DEL USUARIO MATERIA 

//LOGIN TEMPORAL
router.post('/login',controllerUser.logUser);

module.exports = router;