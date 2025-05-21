const db = require('../db/models');
const MateriaUser = db.MateriaUser;

const controllerMateriaUser ={} 
//LISTAR TODAS LAS RELACIONES MATERIA_USUARIO
const getMateriaUsers = async (req,res)=>{
   const materiaUsers = await MateriaUser.findAll({});
   res.send(JSON.stringify(materiaUsers)).status(200)
//   res.status(200).json(materiaUsers)
}
controllerMateriaUser.getMateriaUsers = getMateriaUsers;
//MOSTRAR SOLO UNA MATERIA POR ID
const getByIdMateriasUsers= async (req,res)=>{
    const id = req.params.id
     try{
        const materiaUsers = await MateriaUser.findByPk(id);
        res.send(JSON.stringify(materiaUsers)).status(200)
     //  res.status(200).json(materiaUsers)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR LA RELACION MATERIA_USUARIO'})
    }   
}
controllerMateriaUser.getByIdMateriasUsers = getByIdMateriasUsers;
//ELIMINAR LAS MATERIAS POR ID
const deleteMateriasUsersR = async (req,res)=>{
    const id = req.params.id;
    try{
         const matmateriaUsers= await MateriaUser.findByPk(id);
         matmateriaUsers.destroy();
         res.status(200).json({mensaje:'LA RELACION MATERIA_USUARIO FUE ELIMINADA'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR LA RELACION MATERIA_USUARIO'})
    }    
}
controllerMateriaUser.deleteMateriasUsersR = deleteMateriasUsersR;
//ELIMINAR TODAS LAS MATERIAS_USUARIO
const deleteAllMateriaUserR = async (req, res)=>{
    await MateriaUser.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODAS LAS RELACIONES MATERIAS_USUARIO CORRECTAMENTE'})
}
controllerMateriaUser.deleteAllMateriaUserR = deleteAllMateriaUserR;
//CREAR UNA MATERIA_USUARIO
const createMateriaUser = async (req, res)=>{
    try{
        const {idMateria, idCorrelativa} = req.body;
        const  materiaUserNew = await MateriaUser.create({
            idMateria,
            idCorrelativa     
        })
        res.send(JSON.stringify(materiaUserNew)).status(201)
        //res.status(201).json(materianueva);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR LA RELACION MATERIA_USUARIO'})
    }   
}
controllerMateriaUser.createMateriaUser = createMateriaUser;
//MODIFICAR UNA MATERIA_USUARIO
const updateMateriaUser = async (req , res)=>{
    try{
        const id = req.params.id
        const materiaUserUpdate = await MateriaUser.findByPk(id)
        materiaUserUpdate.set(req.body)
        await materiaUserUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR LA RELACION MATERIA_USUARIO'})
    }
}
controllerMateriaUser.updateMateriaUser = updateMateriaUser;
module.exports = controllerMateriaUser;