const middlewareUser={}
const validarToken= (req, res, next)=>{
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());
    next();
}
middlewareUser.validarToken = validarToken;
//aca va las validaciones de usuario


module.exports = middlewareUser;