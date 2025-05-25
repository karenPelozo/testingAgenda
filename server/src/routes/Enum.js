const enumsTipoEvento ={
    pacial: "pacial",
    tp:"tp",
    exposicion:"exposicion",
    oral:"oral"
}
const tipoEventFreeze = Object.freeze(enumsTipoEvento)
//con esto podiamos manejar los tipos de eventos y los estados para no hacer tantas tablas SON COMO LOS 
// ENUMS EN JAVA 
//PREGUNTAR SI LO PUEDO UTILIZAR.
const  mostrarEnums = ()=>{
    console.log(tipoEventFreeze.oral)
    console.log(tipoEventFreeze.pacial)
    console.log(tipoEventFreeze.tp)
    console.log(tipoEventFreeze.exposicion)
}
module.exports = {tipoEventFreeze}