const db = require('../db/models');
const EstadoMateriaUser = db.EstadoMateriaUser;

const controllerEstadoMateriaUser ={} 
//LISTAR TODOS LOS EVENTOS
const getEstadoMateriaUser = async (req,res)=>{
   const estadoMateriaUser = await EstadoMateriaUser.findAll({});
   res.send(JSON.stringify(estadoMateriaUser)).status(200)
//   res.status(200).json(estadoMateriaUser)
}
controllerEstadoMateriaUser.getEstadoMateriaUser = getEstadoMateriaUser;
//MOSTRAR SOLO UN EVENTO POR ID
const getByIdEstadoMateriaUser = async (req,res)=>{
    const id = req.params.id
     try{
      const estadoMateriaUser = await EstadoMateriaUser.findByPk(id);
     res.send(JSON.stringify(estadoMateriaUser)).status(200)
     //  res.status(200).json(estadoMateriaUser)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR MATERIA'})
    }   
}
controllerEstadoMateriaUser.getByIdEstadoMateriaUser = getByIdEstadoMateriaUser;
//ELIMINAR LAS MATERIAS POR ID
const deleteEstadoMateriaUser = async (req,res)=>{
    const id = req.params.id;
    try{
         const estadoMateriaUser = await EstadoMateriaUser.findByPk(id);
         estadoMateriaUser.destroy();
         res.status(200).json({mensaje:'EL EVENTO FUE ELIMINADO'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR EL EVENTO'})
    }    
}
controllerEstadoMateriaUser.deleteEstadoMateriaUser = deleteEstadoMateriaUser;
//ELIMINAR TODOS LOS EVENTOS
const deleteAllEstadoMateriaUser = async (req, res)=>{
    await EstadoMateriaUser.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODOS LOS EVENTOS CORRECTAMENTE'})
}
controllerEstadoMateriaUser.deleteAllEstadoMateriaUser = deleteAllEstadoMateriaUser;
//CREAR UN EVENTO
const createEstadoMateriaUser = async (req, res)=>{
    try{
        const { body } = req.body;// fijarse que es lo hay en el body
        const estadoMateriaUser = await EstadoMateriaUser.create({
               
            })
        res.send(JSON.stringify(estadoMateriaUser)).status(201)
        //res.status(201).json(eventoNew);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR EL EVENTO'})
    }   
}
controllerEstadoMateriaUser.createEstadoMateriaUser = createEstadoMateriaUser;
//MODIFICAR UN EVENTO
const updateMateriaUser = async (req , res)=>{
    try{
        const id = req.params.id
        const estadoMateriaUser = await EstadoMateriaUser.findByPk(id)
        estadoMateriaUser.set(req.body)
        await estadoMateriaUser.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR EL estado materia user'})
    }
}
controllerEstadoMateriaUser.updateMateriaUser = updateMateriaUser;
module.exports = controllerEstadoMateriaUser;