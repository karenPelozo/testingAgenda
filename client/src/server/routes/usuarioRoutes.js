const { Router } = require("express");
const route = Router();
const controllerUser = require('../controllers/usuarioControllers')
const {middleUsuario,verifyAD, authenticateToken} = require('../middleware')

/*route.post('/register',
     middleUsuario.schemaRegistroValido,
     middleUsuario.verificarExistencia(false),     <----- LO SAQUE POR QUE NO SE USA REGISTRO
     middleUsuario.registroAdminNoPublico,
     controllerUser.registroUser);*/

route.post('/login',
     middleUsuario.schemaLoginValido,
     middleUsuario.verificarExistencia(true),
     middleUsuario.verificarPassword,
     controllerUser.login
    );

route.get('/db/usuarios',
    authenticateToken,
    verifyAD,
    controllerUser.todosUsuarioProtegidosAD
    )

route.get('/db/usuarios/:id',
    authenticateToken,
    verifyAD,
    middleUsuario.existeUserIdAD,
    controllerUser.usuarioPorID
    )
route.post('/db/usuarios',
    authenticateToken,
    verifyAD,
    middleUsuario.schemaRegistroValido, // <---- verifica que los campos esten correctamemte ingresados
    middleUsuario.verificarExistencia(false), //<--- verifica que el usuario no exista 
    controllerUser.createUsuarioAD
    )
route.delete('/db/usuarios/:id',
    authenticateToken,
    verifyAD,
    middleUsuario.existeUserIdAD,
    controllerUser.eliminarUsuario
    )
route.put('/db/usuarios/:id',
    authenticateToken,
    verifyAD,
    middleUsuario.existeUserIdAD,
    controllerUser.actualizacionUsuarioDatos
    )
module.exports = route;