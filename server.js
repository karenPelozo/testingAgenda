const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");


const app = express();
const port = process.env.PORT || 3000;

// Importa la conexión de Sequelize y el modelo de Usuario
const sequelize = require('./client/Data/db');
const User = require('./client/models/User');
const Materia = require('./client/models/Materia');
const Evento = require('./client/models/Evento');


//let materias = require('./client/Data/materias.json'); 
// Si deseas trabajar con una base en blanco, comenta la línea anterior y usa:
let materias = [];

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "public")));

// Ruta raíz: envía el index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "public", "index.html"));
});

// Endpoints para Materias

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
    const nuevasMaterias = req.body.map((m, index) => ({ ...m, id: Date.now() + index }));
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

// Endpoint para Login
app.post("/login", async (req, res) => {
  try {
    const { nombre, password } = req.body;
    if (!nombre || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const user = await User.findOne({ where: { nombre } });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso", user: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para Registrar un Usuario
app.post("/register", async (req, res) => {
  try {
    const { nombre, password, rol } = req.body;
    if (!nombre || !password || !rol) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verifica si el usuario ya existe
    const existingUser = await User.findOne({ where: { nombre } });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el usuario en la base de datos
    const newUser = await User.create({
      nombre,
      password: hashedPassword,
      rol,
    });

    res.status(201).json({ message: "Usuario registrado", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sincronización de la base de datos y arranque del servidor  
sequelize.sync()
  .then(() => {
    console.log("Base de datos y tablas creadas correctamente.");
    app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
  })
  .catch((error) => {
    console.error("Error al sincronizar la base de datos:", error);
  });
