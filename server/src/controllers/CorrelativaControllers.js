const db = require('../db/models');
const Correlativa = db.Correlativa;

const controllerCorrelativa ={} 
//LISTAR TODAS LAS CORRELATIVAS
const getCorrelativa = async (req,res)=>{
   const correlativas = await Correlativa.findAll({});
   res.send(JSON.stringify(Correlativas)).status(200)
//   res.status(200).json(Correlativas)
}
//MOSTRAR SOLO UNA CORRELATIVA POR ID
const getByIdCorrelativa = async (req,res)=>{
    const id = req.params.id
     try{
      const correlativa = await Correlativa.findByPk(id);
     res.send(JSON.stringify(correlativa)).status(200)
     //  res.status(200).json(correlativaNew)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR CORRELATIVA'})
    }   
}
controllerCorrelativa.getByIdCorrelativa = getByIdCorrelativa;
//ELIMINAR LAS CORRELATIVAS POR ID
const deleteCorrelativa = async (req,res)=>{
    //NECESITO SABER SI EL REQ ME TRAJO EL ID DE MATERIA O EL ID DE LA RELACION CORRELATIVA
    const id = req.params.id;
    try{
         const correlativa= await Correlativa.findByPk(id);
         correlativa.destroy();
         res.status(200).json({mensaje:'LA CORRELATIVA FUE ELIMINADA'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR CORRELATIVA'})
    }    
}
controllerCorrelativa.deleteCorrelativa = deleteCorrelativa;
//ELIMINAR TODAS LAS CORRELATIVAS
const deleteAllCorrelativa = async (req, res)=>{
    await Correlativa.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODAS LAS CORRELATIVAS CORRECTAMENTE'})
}
//CREAR UNA MATERIA
const createCorrelativa = async (req, res)=>{
    try{
        console.log("BODY RECIBIDO:", req.body);
        const { correlativas } = req.body;
        const correlativaNew = await Correlativa.create({
              // debo de tener el id de idMateria y IdCorrelativa pero debo de comparar la cadena de stringo con cada correlativa y retorna el id de Materia y correltiva de cada una de las correlativas
            })
        res.send(JSON.stringify(correlativaNew)).status(201)
        //res.status(201).json(correlativaNew);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR LA MATERIA'})
    }   
}
controllerCorrelativa.createCorrelativa = createCorrelativa;
//MODIFICAR UNA CORRELATIVA
const updateCorrelativa= async (req , res)=>{
    try{
        //DEBO DE VERIFICAR DE QUE MATERIA SE TRATA Y RETORNAR EL ID DE LA CORRELATIVA 
        const id = req.params.id
        //ACA DEBE DE HABER UNA CONST QUE ME DE EL ID DE LA CORRELATIVA A MODIFICAR 
        const correlativaUpdate = await Correlativa.findByPk(id)
        correlativaUpdate.set(req.body)
        await correlativaUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR LA CORRELATIVA'})
    }
}
controllerCorrelativa.updateCorrelativa = updateCorrelativa;
module.exports = controllerCorrelativa;