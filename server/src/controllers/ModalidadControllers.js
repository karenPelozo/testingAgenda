const db = require('../db/models');
const Modalidad = db.Modalidad;

const controllerModalidad ={} 
//LISTAR TODAS LAS MODALIDES(3)
const getModalidad = async (req,res)=>{
   const modalidades = await Modalidad.findAll({});
   res.send(JSON.stringify(modalidades)).status(200)
//   res.status(200).json(modalidad)
}
controllerModalidad.getModalidad = getModalidad;
//MOSTRAR SOLO UNA MODALIDAD POR ID
const getByIdModalidad = async (req,res)=>{
    const id = req.params.id
     try{
      const modalidad = await Modalidad.findByPk(id);
     res.send(JSON.stringify(modalidad)).status(200)
     //  res.status(200).json(modalidad)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR MODALIDAD'})
    }   
}
controllerModalidad.getByIdModalidad = getByIdModalidad;
//ELIMINAR LAS MODALIDADES POR ID
const deleteModalidad = async (req,res)=>{
    const id = req.params.id;
    try{
         const modalidad= await Modalidad.findByPk(id);
         modalidad.destroy();
         res.status(200).json({mensaje:'LA MODALIDAD FUE ELIMINADA'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR MODALIDAD'})
    }    
}
controllerModalidad.deleteModalidad = deleteModalidad;
//ELIMINAR TODAS LAS MATERIAS
const deleteAllModalidades = async (req, res)=>{
    await Modalidad.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODAS LAS MODALIDES CORRECTAMENTE'})
}
controllerModalidad.deleteAllModalidades = deleteAllModalidades;
//CREAR UNA MODALIDAD
const createModalidad = async (req, res)=>{
    try{
        const { modalidad } = req.body;
        //NO CREO QUE ESTO SE USE PERO AGREGO DE TODAS FORMAS
        const modalidadnew = await Modalidad.create({
            nameModalidad,
            idMateria
        })
        res.send(JSON.stringify(modalidadnew)).status(201)
        //res.status(201).json(modalidadnew);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR LA MODALIDAD'})
    }   
}
controllerModalidad.createModalidad = createModalidad;
//MODIFICAR UNA MODALIDAD
const updateModalidad = async (req , res)=>{
    try{
        const id = req.params.id
        const modalidadUpdate = await Modalidad.findByPk(id)
        modalidadUpdate.set(req.body)
        await modalidadUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR LA MODALIDAD'})
    }
}
controllerModalidad.updateModalidad = updateModalidad;
module.exports = controllerModalidad;