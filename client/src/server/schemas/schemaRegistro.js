const Joi = require('joi')
const schemaRegistro = Joi.object({
    nombre: Joi.string()
    .min(4)
    .max(30)
    .required()
    .messages({
        'string.base' : 'EL NOMBRE DEBE SER UNA CADENA DE TEXTO',
        'string.min':'EL NOMBRE DEBE DE TENER COMO MINIMO {#limit} CARACTERES', 
        'string.max':'EL NOMBRE DEBE DE TENER COMO MAXIMO {#limit} CARACTERES', 
        'any.required':'EL CAMPO NOMBRE ES REQUERIDO'
    }),
    password: Joi.string()
    .min(4)
    .max(30)
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9]{4,30}$'))
    .messages({
        'string.min':'LA CONTRASEÑA DEBE DE TENER COMO MINIMO {#limit} CARACTERES',
        'string.max':'LA CONTRASEÑA DEBE DE TENER COMO MAXIMO {#limit} CARACTERES', 
        'any.required':'EL CAMPO PASSWORD ES REQUERIDO',
        'string.pattern.base': 'LA CONTRASEÑA NO ES VALIDA DEBE DE CONTENER mayusculas, minusculas o simbolos distinto de . o ;'
    }),
    rol: Joi.string().required().valid('administrador','estudiante')
})
module.exports = schemaRegistro;