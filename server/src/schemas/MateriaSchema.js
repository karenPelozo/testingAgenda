const Joi = require('joi');
const schemaMateria = Joi.object({
    namemateria: Joi.string().required().messages({
        
    }),
    anioDeCarrera: Joi.number().integer().min(1).max(6).required(),
    anio: Joi.number().integer().min(2025).required(),
    horario: Joi.string().required().regex(/^(Lunes|Martes|Miercoles|Jueves|Viernes|Sabado)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
        .error(new Error('EL HORARIO ES INVALIDO DEBE DE SER DE LA FORMA DIA HH:mm - HH:mm')),
    modalidad: Joi.string().required().valid('Presencial','Virtual','Híbrido'),
    correlativas: Joi.array().items(Joi.string()).default([]),
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
    })
})
module.exports = schemaMateria