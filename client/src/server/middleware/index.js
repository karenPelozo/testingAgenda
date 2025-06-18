const middleUsuario = require('./userMiddleware')
//const middleMateria= require('./materiasMiddleware')
//aca va modalidad
const authenticateToken =  require('./auth')
const verifyAD = require('./verifyAdmin')

module.exports ={middleUsuario,verifyAD,authenticateToken}
