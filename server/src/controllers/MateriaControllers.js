const db = require('../db/models');
const Materia = db.Materia;

const controllerMateria ={} 
//LISTAR TODAS LAS MATERIAS
const getMaterias = async (req,res)=>{
   const materias = await Materia.findAll({});
   res.status(200).json(materias)
}
controllerMateria.getMaterias = getMaterias;
//MOSTRAR SOLO UNA MATERIA POR ID
const getByIdMaterias = async (req,res)=>{
    const id = req.params.id
     try{
      const materia = await Materia.findByPk(id)
      res.status(200).json(materia)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR MATERIA'})
    }   
}
controllerMateria.getByIdMaterias = getByIdMaterias;
//ELIMINAR LAS MATERIAS POR ID
const deleteMateria = async (req,res)=>{
    const id = req.params.id;
    try{
         const materia= await Materia.findByPk(id);
         materia.destroy();
         res.status(200).json({mensaje:'LA MATERIA FUE ELIMINADA'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR MATERIA'})
    }    
}
controllerMateria.deleteMateria = deleteMateria;
//ELIMINAR TODAS LAS MATERIAS
const deleteAll = async (req, res)=>{
    const data = await Materia.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODAS LAS MATERIAS CORRECTAMENTE'})
}
controllerMateria.deleteAll = deleteAll;
//CREAR UNA MATERIA
const createMateria = async (req, res)=>{
    try{
        console.log("BODY RECIBIDO:", req.body);
        const { namemateria, anioDeCarrera, anio, horario, idmodalidad } = req.body;
        const materianueva = await Materia.create({
              namemateria,
              anioDeCarrera,
              anio,
              horario,
              idmodalidad
    })
        res.status(201).json(materianueva);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR LA MATERIA'})
    }   
}
controllerMateria.createMateria = createMateria;
//MODIFICAR UNA MATERIA
const updateMateria = async (req , res)=>{
    try{
        const id = req.params.id
        const materiaUpdate = await Materia.findByPk(id)
        materiaUpdate.set(req.body)
        await materiaUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR LA MATERIA'})
    }
}
controllerMateria.updateMateria = updateMateria;
module.exports = controllerMateria;