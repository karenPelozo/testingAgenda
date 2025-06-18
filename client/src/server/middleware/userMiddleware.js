const User = require('../../../models/User');
const bcrypt =require('bcrypt');
const schemaLogin = require('../schemas/schemaLogin')
const schemaRegistro = require('../schemas/schemaRegistro')

const schemaLoginValido= async(req, res, next) =>{
    const {error} = schemaLogin.validate(req.body)
        if(error){
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}
const schemaRegistroValido = async (req, res, next)=>{
    const {error} = schemaRegistro.validate(req.body)
    if(error){
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}
/*const camposObligatorios = async (req,res,next)=>{
    const { nombre, password, rol } = req.body;
    if (schemaUsuarioRegistro) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    next();
}*/
/*const registroAdminNoPublico = async(req , res, next)=>{
    const { rol } = req.body;
    if (rol.toLowerCase() === "administrador" || rol.toLowerCase() === "admin") {
      return res.status(403).json({ error: "No se permite el auto-registro de administradores" });
    }
    next();
}*/
const verificarExistencia = (debeExistir)=>{
    return async (req, res, next)=>{
        const nombre = req.body.nombre || req.params.nombre;
       /*  if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }*/
        try {
            const userEncontrado = await User.findOne({ where: { nombre } });
            if(debeExistir){
                 if (!userEncontrado) {
                    return res.status(404).json({ message: 'Usuario no encontrado.' });
                }
                req.user = userEncontrado;
                next()
            }else{
                if (userEncontrado) {
                    return res.status(409).json({ message: 'El usuario ya existe.' });
                    
                }
                next()
            }
        } catch (error) {
            console.error('Error en el middleware verificarExistencia:', error);
            res.status(500).json({ message: 'Error al verificar usuario.' });
        }
    }
}
const verificarPassword = async(req, res, next)=>{
    try{ const {nombre ,password}= req.body;
     const user = await User.findOne({ where: { nombre } });
     if (!user) { 
            return res.status(401).json({ error: "Credenciales inválidas: Usuario no encontrado." });
        }
     const validPassword = await bcrypt.compare(password, user.password);
     if (!validPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }
        req.user = user
    next()
    }catch(error){
         res.status(500).json({ message: 'Error interno del servidor al verificar la contraseña.' });
    }
}
/*const existeUser = async (req,res , next)=>{
 const { nombre , password } = req.body;
 const user = await User.findOne({ where: { nombre } });
  if (!user) {
     return res.status(401).json({ error: "Usuario no encontrado" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
 if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
        }
    next()
}*/
/*const passwordValida = async (req , res, next)=>{
const { nombre, password } = req.body;
 const user = await User.findOne({ where: { nombre } });
 const validPassword = await bcrypt.compare(password, user.password);
 if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
        }
}*/
/*const existeUserIdAD= async(req, res, next)=>{
   try {
      const { id } = req.params;
        const user = await User.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
     }
     next();
   } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor al verificar ID de usuario.' });
   }
}*/

const verificaUsuario = ({ debeExistir = true } = {}) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      let usuario;

      // Si viene por ID
      if (id) {
        usuario = await User.findByPk(id);
      }

      // Si viene por nombre (por ejemplo, en POST)
      if (!id && nombre) {
        usuario = await User.findOne({ where: { nombre } });
      }

      // Lógica según lo que esperás
      if (debeExistir && !usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (!debeExistir && usuario) {
        return res.status(409).json({ error: "Ya existe un usuario con ese nombre" });
      }

      // Lo guardás por si lo querés usar después
      req.usuarioEncontrado = usuario || null;

      next();
    } catch (error) {
      console.error("Error en middleware verificaUsuario:", error);
      res.status(500).json({
        error: "Error interno en la verificación del usuario",
        detalle: error.message
      });
    }
  };
};

module.exports = {
    schemaLoginValido,
    schemaRegistroValido,
    verificarExistencia,
    verificarPassword,
    verificaUsuario   
}
