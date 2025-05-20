const Joi = require('joi');
const schemaMateria = Joi.object({
    namemateria: Joi.string().required(),
    anioDeCarrera: Joi.number().integer().min(1).max(6).required(),
    anio: Joi.number().integer().min(2025).required(),
    horario: Joi.string().required(),
    idmodalidad: Joi.number().integer().required(),
   /* correlativas: Joi.array().items(Joi.number().integer()).default([]),
    notas: Joi.object({
        parcial1: Joi.number().integer().min(0).max(10),
        parcial2: Joi.number().integer().min(0).max(10),
        parcialFinal: Joi.number().integer().min(0).max(10)
    }),
    eventos: Joi.object({
        tipo: Joi.string(),
        numero: Joi.number().min(1).max(10),
        temasAEstudiar: Joi.string(),
        estado: Joi.string(),
        fechaEntrega: Joi.string()
    })*/
})
module.exports = schemaMateria