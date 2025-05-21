const db = require('../db/models');
const Evento = db.Evento;

const controllerEvento ={} 
//LISTAR TODOS LOS EVENTOS
const getEventos = async (req,res)=>{
   const eventos = await Evento.findAll({});
   res.send(JSON.stringify(eventos)).status(200)
//   res.status(200).json(eventos)
}
controllerEvento.getEventos = getEventos;
//MOSTRAR SOLO UN EVENTO POR ID
const getByIdEvento = async (req,res)=>{
    const id = req.params.id
     try{
      const evento = await Evento.findByPk(id);
     res.send(JSON.stringify(evento)).status(200)
     //  res.status(200).json(evento)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR MATERIA'})
    }   
}
controllerEvento.getByIdEvento = getByIdEvento;
//ELIMINAR LAS MATERIAS POR ID
const deleteEvento = async (req,res)=>{
    const id = req.params.id;
    try{
         const evento = await Evento.findByPk(id);
         evento.destroy();
         res.status(200).json({mensaje:'EL EVENTO FUE ELIMINADO'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR EL EVENTO'})
    }    
}
controllerEvento.deleteEvento = deleteEvento;
//ELIMINAR TODOS LOS EVENTOS
const deleteAllEventos = async (req, res)=>{
    await Evento.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODOS LOS EVENTOS CORRECTAMENTE'})
}
controllerEvento.deleteAllEventos = deleteAllEventos;
//CREAR UN EVENTO
const createEvento = async (req, res)=>{
    try{
        const {  tipo, numero, temasAEstudiar, estado, fechaEntrega  } = req.body;
        const eventoNew = await Evento.create({
                tipo,
                numero,
                temasAEstudiar, 
                estado, 
                fechaEntrega 
            })
        res.send(JSON.stringify(eventoNew)).status(201)
        //res.status(201).json(eventoNew);
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL INGRESAR EL EVENTO'})
    }   
}
controllerEvento.createEvento = createEvento;
//MODIFICAR UN EVENTO
const updateEvento = async (req , res)=>{
    try{
        const id = req.params.id
        const eventoUpdate = await Evento.findByPk(id)
        eventoUpdate.set(req.body)
        await eventoUpdate.save();
        res.status(201).json({mensaje: 'SE MODIFICO CORRECTAMENTE'})
    }catch(error){
        res.status(500).json({mensaje: 'ERROR AL MODIFICAR EL EVENTO'})
    }
}
controllerEvento.updateEvento = updateEvento;
module.exports = controllerEvento;