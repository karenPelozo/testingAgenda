const controllerMateria ={}
const getMaterias =()=>{
    console.log("lista de materias")
}
controllerMateria.getMaterias = getMaterias;
const getByIdMaterias =()=>{
    console.log("muestra una sola materia por id")
}
controllerMateria.getByIdMaterias = getByIdMaterias;
module.exports = controllerMateria;