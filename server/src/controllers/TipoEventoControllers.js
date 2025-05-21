const db = require('../db/models');
const TipoEvento = db.TipoEvento;

const controllerTipoEvento ={} 
//LISTAR TODOS LOS EVENTOS
const getTipoEventos = async (req,res)=>{
   const tipoEventos = await TipoEvento.findAll({});
   res.send(JSON.stringify(tipoEventos)).status(200)
//   res.status(200).json(tipoEvento)
}
controllerTipoEvento.getTipoEventos = getTipoEventos;
//MOSTRAR SOLO UN EVENTO POR ID
const getByIdTipoEvento = async (req,res)=>{
    const id = req.params.id
     try{
      const tipoevento = await TipoEvento.findByPk(id);
     res.send(JSON.stringify(tipoevento)).status(200)
     //  res.status(200).json(tipoevento)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR EL TIPO DE EVENTO'})
    }   
}
controllerTipoEvento.getByIdTipoEvento = getByIdTipoEvento;
//ELIMINAR LAS MATERIAS POR ID
const deleteTipoEvento = async (req,res)=>{
    const id = req.params.id;
    try{
         const tipoevento = await TipoEvento.findByPk(id);
         tipoevento.destroy();
         res.status(200).json({mensaje:'EL TIPO DE EVENTO FUE ELIMINADO'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR EL TIPO DE EVENTO'})
    }    
}
controllerTipoEvento.deleteTipoEvento = deleteTipoEvento;
//ELIMINAR TODOS LOS TIPOS DE EVENTOS
const deleteAllTipoEventos = async (req, res)=>{
    await TipoEvento.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODOS LOS EVENTOS CORRECTAMENTE'})
}
controllerTipoEvento.deleteAllTipoEventos = deleteAllTipoEventos;
//CREAR UN EVENTO
const createTipoEvento = async (req, res)=>{
    try{
        const {  tipo } = req.body;
        const tipoeventoNew = await TipoEvento.create({
                tipo                
            })
        res.send(JSON.stringify(tipoeventoNew)).status(201)
        //res.status(201).json(eventoNew);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR EL EVENTO'})
    }   
}
controllerTipoEvento.createTipoEvento = createTipoEvento;
//MODIFICAR UN EVENTO
const updateTipoEvento = async (req , res)=>{
    try{
        const id = req.params.id
        const tipoeventoUpdate = await TipoEvento.findByPk(id)
        tipoeventoUpdate.set(req.body)
        await tipoeventoUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR'})
    }
}
controllerTipoEvento.updateTipoEvento = updateTipoEvento;
module.exports = controllerTipoEvento;