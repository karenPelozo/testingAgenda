## Para iniciar primero ejecutamos

npm init -y

## instalamos express

npm install express

## Nodemon

npm install --save-dev nodemon

## instalamos cors

npm install cors

## Ejecutamos el servidor
npm run dev

## Swagger
http://localhost:3000/api-docs

## en caso que haya que reinstalar el package.json
rm -rf node_modules package-lock.json  # Elimina las dependencias y el archivo lock
npm install  # Reinstala todas las dependencias

# endpoint de ejemplo

{
  "nombre": "Matemática I",
  "anioDeCarrera": 2,
  "anio": "2025",
  "horario": "Lunes 08:00 - 12:00",
  "modalidad": "Presencial",
  "correlativas": [""],
  "notas": {
    "parcial1": 7,
    "parcial2": 8,
    "final": null
  },
  "eventos": [
    {
      "tipo": "Parcial",
      "numero": 1,
      "temasAEstudiar": "Funciones, límites",
      "estado": "En curso",
      "fechaEntrega": "2025-06-10"
    },
    {
      "tipo": "Trabajo Práctico",
      "numero": 2,
      "temasAEstudiar": "Proyecto de integración",
      "estado": "Pendiente",
      "fechaEntrega": "2025-05-15"
    }
  ]
}