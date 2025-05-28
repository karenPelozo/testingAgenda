const bcrypt = require('bcrypt')
const db = require('../db/models');
const User = db.User;

const controllerUser ={} 
//LISTAR TODAS USUARIOS
const getUser = async (req,res)=>{
   const usuarios = await User.findAll({});
   res.status(200).json(usuarios)
}
controllerUser.getUser = getUser;
//MOSTRAR SOLO UN USUARIO POR ID
const getByIdUser = async (req,res)=>{
    const id = req.params.id
     try{
      const usuario = await User.findByPk(id)
      res.status(200).json(usuario)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR USUARIO'})
    }   
}
controllerUser.getByIdUser = getByIdUser;
//ELIMINAR USUARIO POR ID
const deleteUser = async (req,res)=>{
    const id = req.params.id;
    try{
         const usuario= await User.findByPk(id);
         usuario.destroy();
         res.status(200).json({mensaje:'EL USUARIO FUE ELIMINADO'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR USUARIO'})
    }    
}
controllerUser.deleteUser = deleteUser;
//ELIMINAR TODOS USUARIO
const deleteAllUsers = async (req, res)=>{
    const data = await User.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODAS LAS MATERIAS CORRECTAMENTE'})
}
controllerUser.deleteAllUsers = deleteAllUsers;
//CREAR USUARIO
const createUser = async (req, res)=>{
    try{
        console.log("BODY RECIBIDO:", req.body);
        const { nameuser, passworduser, roluser} = req.body;
        const usuarioNew = await User.create({
             nameuser, passworduser, roluser
    })
        res.status(201).json(usuarioNew);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR EL USUARIO'})
    }   
}
controllerUser.createUser = createUser;
//MODIFICAR USUARIO
const updateUser = async (req , res)=>{
    try{
        const id = req.params.id
        const usuarioUpdate = await User.findByPk(id)
        usuarioUpdate.set(req.body)
        await usuarioUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR EL USUARIO'})
    }
}
controllerUser.updateUser = updateUser;
//LOG TEMPORAL
const logUser = async (req, res)=>{
   
    try{
       
        const { nameuser, passworduser } = req.body;
            if (!nameuser || !passworduser) {
                 return res.status(400).json({ error: "Faltan campos obligatorios" });
        const usuario = await User.findOne({ where: { nameuser } });
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(passworduser, usuario.passworduser);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
   // req.session.usuario = usuario
    /*res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
            });
    */
   
   res.json({ message: "Login exitoso", usuario: { id: usuario.id, nombre: usuario.nameuser, rol: usuario.roluser } });
    }
    }catch(error){
        console.error('Error en login:', error);
        res.status(500).json({ error: error.message })
       
    }
}
controllerUser.logUser = logUser;
module.exports = controllerUser;