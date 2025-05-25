const db = require('../db/models');
const Resultado = db.Resultado;


//LISTAR TODOS LOS RESULTADOS
const getResultado = async (req,res)=>{
   const resultados = await Resultado.findAll({});
   res.send(JSON.stringify(resultados)).status(200)
//   res.status(200).json(materias)
}

//MOSTRAR SOLO UNA MATERIA POR ID
const getByIdResultado = async (req,res)=>{
    const id = req.params.id
     try{
      const resultados = await Resultado.findByPk(id);
     res.send(JSON.stringify(resultados)).status(200)
     //  res.status(200).json(materia)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR EL RESULTADO'})
    }   
}

//ELIMINAR LAS MATERIAS POR ID
const deleteResultado = async (req,res)=>{
    const id = req.params.id;
    try{
         const resultados= await Resultado.findByPk(id);
         resultados.destroy();
         res.status(200).json({mensaje:'EL RESULTADO FUE ELIMINADA'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR EL RESULTADO'})
    }    
}

//ELIMINAR TODAS LAS MATERIAS
const deleteAllResultado = async (req, res)=>{
    await Resultado.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODAS LAS MATERIAS CORRECTAMENTE'})
}

//CREAR UNA MATERIA
const createResultado = async (req, res)=>{
    try{
        const idModalidad = 0
        const { nota, idEvento } = req.body;
        const resultados = await Resultado.create({
            nota, idEvento      
        })
        res.send(JSON.stringify(resultados)).status(201)
        //res.status(201).json(materianueva);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR EL RESULTADO'})
    }   
}

//MODIFICAR UN RESULTADO
const updateResultado = async (req , res)=>{
    try{
        const id = req.params.id
        const resultadosUpdate = await Resultado.findByPk(id)
        resultadosUpdate.set(req.body)
        await resultadosUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR EL RESULTADO'})
    }
}

module.exports = { getResultado, getByIdResultado, deleteResultado, deleteAllResultado, createResultado, updateResultado };