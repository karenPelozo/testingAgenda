const schemaMateria = require('../schemas/MateriaSchema')
const db = require('../db/models');
const Materia = db.Materia;

const  schemaValido=(req,res,next)=>{
    const {error} = schemaMateria.validate(req.body)
     if (error) {
        return res.status(400).json({ error: error.details[0].message });
  }
    next()
}
const existeMateria= async (req,res,next)=>{
     const id = req.params.id
     const materia = await Materia.findByPk(id)
     if(!materia){
         return res.status(404).json({ mensaje: 'LA MATERIA NO FUE ENCONTRADA' });
     }
    next()
}
module.exports = {schemaValido,existeMateria}