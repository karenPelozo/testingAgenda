const db = require('../db/models');
const EstadoEvento = db.EstadoEvento;

const controllerEstadoEvento ={} 
//LISTAR TODOS LOS EVENTOS
const getEstadoEventos = async (req,res)=>{
   const estadoEvento = await EstadoEvento.findAll({});
   res.send(JSON.stringify(estadoEvento)).status(200)
//   res.status(200).json(eventos)
}
controllerEstadoEvento.getEstadoEventos = getEstadoEventos;
//MOSTRAR SOLO UN EVENTO POR ID
const getByIdEstadoEvento = async (req,res)=>{
    const id = req.params.id
     try{
      const estadoEvento = await EstadoEvento.findByPk(id);
     res.send(JSON.stringify(estadoEvento)).status(200)
     //  res.status(200).json(evento)
    }catch(error){
        res.status(404).json({mensaje:'ERROR AL ENCONTRAR MATERIA'})
    }   
}
controllerEstadoEvento.getByIdEstadoEvento = getByIdEstadoEvento;
//ELIMINAR LAS MATERIAS POR ID
const deleteEstadoEvento = async (req,res)=>{
    const id = req.params.id;
    try{
         const estadoEvento = await EstadoEvento.findByPk(id);
         estadoEvento.destroy();
         res.status(200).json({mensaje:'EL EVENTO FUE ELIMINADO'});
    }catch(error){
        res.status(500).json({mensaje:'ERROR AL ENCONTRAR EL EVENTO'})
    }    
}
controllerEstadoEvento.deleteEstadoEvento = deleteEstadoEvento;
//ELIMINAR TODOS LOS EVENTOS
const deleteAllEstadoEventos = async (req, res)=>{
    await EstadoEvento.destroy({where: {}});
    //res.status(QUE NUM HIRIA).json({mensaje: 'ELINACION DE TODOS LOS EVENTOS CORRECTAMENTE'})
}
controllerEstadoEvento.deleteAllEstadoEventos = deleteAllEstadoEventos;
//CREAR UN EVENTO
const createEstadoEvento = async (req, res)=>{
    try{
        const {  tipo, numero, temasAEstudiar, estado, fechaEntrega  } = req.body;
        const eventoNew = await EstadoEvento.create({
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