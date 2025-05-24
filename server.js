const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;

// Importa la conexión de Sequelize y los modelos
const sequelize = require('./client/Data/db');
const User = require('./client/models/User');
const Materia = require('./client/models/Materia');
const Evento = require('./client/models/Evento');

// Definir asociaciones entre Materia y Evento
Materia.hasMany(Evento, { foreignKey: 'materiaId', as: 'eventos' });
Evento.belongsTo(Materia, { foreignKey: 'materiaId', as: 'materia' });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "public")));

// Ruta raíz: envía el index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "public", "index.html"));
});

/*===========================================
  Endpoints para Usuarios
============================================*/

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

// Endpoint para Login de Usuario
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

/*===========================================
  Endpoints para Materias y Eventos en la Base de Datos
============================================*/

// Crear una materia (con sus eventos)
app.post("/db/materia", async (req, res) => {
  try {
    // Se espera recibir un JSON similar a:
    // { "nombre": "Matemática 1", "anioDeCarrera": 1, "anio": "2025", "horario": "Lunes 8:00 - 12:00",
    //   "modalidad": "Presencial", "correlativas": [], "notas": { "parcial1": 0, "parcial2": 0, "final": 0 },
    //   "eventos": [ { "tipo": "Parcial", "numero": 1, "temasAEstudiar": "Algo", "estado": "En curso",
    //                "fechaEntrega": "2025-07-01" } ], "userId": 2 }
    const { nombre, anioDeCarrera, anio, horario, modalidad, correlativas, notas, eventos, userId } = req.body;
    
    if (!nombre || !anioDeCarrera) {
      return res.status(400).json({ error: "Faltan campos obligatorios en la materia" });
    }
    
    const materiaData = {
      nombre,
      anioDeCarrera,
      anio: anio || null,
      horario: horario || null,
      modalidad: modalidad || null,
      correlativas: correlativas || [],
      notaParcial1: notas ? notas.parcial1 : null,
      notaParcial2: notas ? notas.parcial2 : null,
      notaFinal: notas ? notas.final : null,
      userId: userId || null
    };

    const materiaCreada = await Materia.create(materiaData);
    
    if (eventos && Array.isArray(eventos)) {
      for (const evt of eventos) {
        await Evento.create({
          tipo: evt.tipo,
          numero: evt.numero,
          temasAEstudiar: evt.temasAEstudiar,
          estado: evt.estado,
          fechaEntrega: evt.fechaEntrega,
          materiaId: materiaCreada.id
        });
      }
    }
    
    const materiaConEventos = await Materia.findOne({
      where: { id: materiaCreada.id },
      include: [{ model: Evento, as: "eventos" }]
    });
    
    res.status(201).json(materiaConEventos);
  } catch (error) {
    console.error("Error al crear la materia:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las materias de un usuario (filtrando por userId)
app.get("/db/materias", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "No se especificó el ID de usuario" });
    }
    const materiasDB = await Materia.findAll({
      where: { userId },
      include: [{ model: Evento, as: "eventos" }]
    });
    res.json(materiasDB);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una materia por ID (incluyendo sus eventos)
app.get("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const materia = await Materia.findOne({
      where: { id },
      include: [{ model: Evento, as: "eventos" }]
    });
    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }
    res.json(materia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar (editar) una materia existente (y sus eventos)
app.put("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const materia = await Materia.findByPk(id);

    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    const { nombre, anioDeCarrera, anio, horario, modalidad, correlativas, notas, eventos, userId } = req.body;

    await materia.update({
      nombre,
      anioDeCarrera,
      anio,
      horario,
      modalidad,
      correlativas,
      notaParcial1: notas ? notas.parcial1 : null,
      notaParcial2: notas ? notas.parcial2 : null,
      notaFinal: notas ? notas.final : null,
      userId
    });

    // Actualizar los eventos: elimina los eventos existentes y crea los nuevos
    if (eventos && Array.isArray(eventos)) {
      await Evento.destroy({ where: { materiaId: id } });
      for (const evt of eventos) {
        await Evento.create({
          tipo: evt.tipo,
          numero: evt.numero,
          temasAEstudiar: evt.temasAEstudiar,
          estado: evt.estado,
          fechaEntrega: evt.fechaEntrega,
          materiaId: id
        });
      }
    }

    const materiaActualizada = await Materia.findOne({
      where: { id },
      include: [{ model: Evento, as: "eventos" }]
    });

    res.json(materiaActualizada);
  } catch (error) {
    console.error("Error al actualizar la materia:", error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una materia (junto a sus eventos)
app.delete("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Elimina primero los eventos asociados
    await Evento.destroy({ where: { materiaId: id } });
    const rowsDeleted = await Materia.destroy({ where: { id } });
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }
    res.sendStatus(204);
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
