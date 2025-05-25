const express = require('express')
const util = express()
const db = require('../db/models');
const Materia = db.Materia;
const Modalidad= db.Modalidad
const Evento = db.Evento
const Resultado = db.Resultado
const Correlativa= db.Correlativa
const controllerMateria ={} 
//LISTAR TODAS LAS MATERIAS
const getMaterias = async (req,res)=>{
   const materias = await Materia.findAll({});
   //res.send(JSON.stringify(materias)).status(200)
  res.status(200).json(materias)
}
controllerMateria.getMaterias = getMaterias;
//MOSTRAR SOLO UNA MATERIA POR ID
const getByIdMaterias = async (req,res)=>{
    const id = req.params.id
     try{
      const materia = await Materia.findByPk(id,{
       include:[
        {
            model: Modalidad
        },{
            model: Evento,
            include: {
                model:Resultado,
                as:'Nota'
            }
        }
       ]
      });  
     res.send(JSON.stringify(materia)).status(200)
     //  res.status(200).json(materia)
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
    await Materia.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODAS LAS MATERIAS CORRECTAMENTE'})
}
controllerMateria.deleteAll = deleteAll;
//CREAR UNA MATERIA
const createMateria = async (req, res)=>{
    try{
        console.log("BODY RECIBIDO:", req.body);
        const { namemateria, anioDeCarrera, anio, horario, modalidad,correlativas ,nota, evento } = req.body;
          const materianueva = await Materia.create({
              namemateria,
              anioDeCarrera,
              anio,
              horario
            })
            // debo de relacionarlo con los idMateria.
        const correlativasC={}
        const cargaCorrelativas= correlativas.forEach(nombreC => {
                 correlativasC= async()=>{
                    await Correlativa.create({
                       nameCorrelativa: nombreC,
                       MateriaCorrelativa: materianueva.idMateria
                })
            }
        });
        
        const modalidadC= await Modalidad.create({
            modalidad,
            idMateria : materianueva.idMateria
        })
        const eventoC=await Evento.create({
            evento,
            idMateria: materianueva.idMateria
        })
        const resultadoC= await Resultado.create({
            nota,
            idEvento: eventoC.idEvento
        })
      
        res.send(JSON.stringify(materianueva)).status(201)
        //res.status(201).json(materianueva);
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
        const { namemateria, anioDeCarrera, anio, horario, modalidad,correlativas ,nota, evento } = req.body;
       //DEBO USAR CREATE Y SAVE CON LOS CAMPOS A CANVIAR PERO DEBO DE MODIFICAR LOS CAMPOS SEGURO UTILIZE EXPRESS POR LOS ID
       materiaUpdate.namemateria= namemateria
       materiaUpdate.anioDeCarrera=anioDeCarrera
       materiaUpdate.anio=anio
       materiaUpdate.horario= horario
       const mod = materiaUpdate.modalidad
       mod.nameModalidad= modalidad
       mod.save({fields:['nameModalidad']})
       materiaUpdate.modalidad=mod
       const correlativasC={}
       const cargaCorrelativas=async()=>{
                 const ids = 0
            }
       
       await materiaUpdate.save({fiels:[
        'namemateria',
        'anioDeCarrera',
        'anio',
        'horario',
       // 'modalidad',
    ]});
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR LA MATERIA'})
    }
}
controllerMateria.updateMateria = updateMateria;
module.exports = controllerMateria;