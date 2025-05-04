const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

let materias = require('./client/Data/materias.json'); // Comentar esto para no trabajar con un json local, le pusimos let y no const para que permita eliminar

app.use(express.json());
app.use(cors());


//let materias = []; 
/*activar este array y eliminar o comentar const materias =
 require('./client/Data/materias.json') para trabajar con una base en blanco*/


app.use(express.static(path.join(__dirname, "client", "public")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "public", "index.html"));
});


app.get("/materias", (req, res) => {

  res.json(materias);
});


app.get("/materias/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const materia = materias.find(m => m.id === id);
  if (materia) {
    res.json(materia);
  } else {
    res.status(404).json({ error: "Materia no encontrada" });
  }
});


app.post("/materias", (req, res) => {
  if (Array.isArray(req.body)) {
    const nuevasMaterias = req.body.map((m, index) => {
      return { ...m, id: Date.now() + index };
    });
    materias = materias.concat(nuevasMaterias);
    res.status(201).json(nuevasMaterias);
  } else {
    const nuevaMateria = { ...req.body, id: Date.now() };
    materias.push(nuevaMateria);
    res.status(201).json(nuevaMateria);
  }
});


app.put("/materias/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = materias.findIndex(materia => materia.id === id);
  if (index !== -1) {
    materias[index] = { ...materias[index], ...req.body };
    res.json(materias[index]);
  } else {
    res.status(404).json({ error: "Materia no encontrada" });
  }
});


app.delete("/materias/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const prevLength = materias.length;
  materias = materias.filter(materia => materia.id !== id);
  if (materias.length < prevLength) {
    res.sendStatus(204);
  } else {
    res.status(404).json({ error: "Materia no encontrada" });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});