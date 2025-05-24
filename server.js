const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;

// Importa la conexión de Sequelize y los modelos
const sequelize = require('./client/Data/db');
const User = require('./client/models/User');
const { Materia, MateriaUsuario, Evento, Modalidad } = require('./client/models/index');

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "public")));

// Ruta raíz: enviar index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "public", "index.html"));
});

/*===========================================
  Endpoints para Usuarios
============================================*/

// Registro de Usuario
app.post("/register", async (req, res) => {
  try {
    const { nombre, password, rol } = req.body;
    if (!nombre || !password || !rol) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const existingUser = await User.findOne({ where: { nombre } });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
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

// Login de Usuario
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
  Endpoints para Inscripciones de Materias y Eventos
============================================*/

// POST: Inscribir a un usuario en una materia y registrar sus eventos
app.post("/db/materia", async (req, res) => {
  try {
    // Se espera recibir un JSON similar a:
    // {
    //   "NombreMateria": "Matemática 1",
    //   "anio": "2025",
    //   "horario": "Lunes 8:00 - 12:00",
    //   "modalidad": "Presencial", // esto se utiliza solo desde el select global de Materia
    //   "correlativas": [],  // opcional
    //   "eventos": [
    //      {
    //        "tipo": "Parcial 1",
    //        "anioDeCarrera": 1,
    //        "anio": 2025,
    //        "idModalidad": 1,  // idModalidad de la modalidad seleccionada (Presencial, etc.)
    //        "dia": "Lunes",
    //        "horaInicio": "08:00",
    //        "horaFin": "10:00",
    //        "fechaExamen": "2025-06-15",
    //        "notaParcial1": 8.5,
    //        "notaParcial2": 7.0,
    //        "notaFinal": 9.0
    //      }
    //   ],
    //   "idUsuario": 2
    // }
    const { NombreMateria, anio, horario, modalidad, correlativas, eventos, idUsuario } = req.body;
    if (!NombreMateria || !idUsuario) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Busca o crea la materia global
    let materia = await Materia.findOne({ where: { NombreMateria } });
    if (!materia) {
      materia = await Materia.create({ NombreMateria, anio, horario, modalidad, correlativas });
    }
    
    // Crea la inscripción (relación) del usuario con la materia
    const inscripcion = await MateriaUsuario.create({
      idMateria: materia.idMateria,
      idUsuario
    });
    
    // Crea los eventos asociados a esta inscripción
    if (eventos && Array.isArray(eventos)) {
      for (const evt of eventos) {
        await Evento.create({
          tipo: evt.tipo,
          anioDeCarrera: evt.anioDeCarrera,
          anio: evt.anio,
          idModalidad: evt.idModalidad,
          dia: evt.dia,
          horaInicio: evt.horaInicio,
          horaFin: evt.horaFin,
          fechaExamen: evt.fechaExamen,
          notaParcial1: evt.notaParcial1,
          notaParcial2: evt.notaParcial2,
          notaFinal: evt.notaFinal,
          idMateriaUsuario: inscripcion.idMateriaUsuario
        });
      }
    }
    
    // Recupera la inscripción completa con la materia y sus eventos
    const inscripcionCompleta = await MateriaUsuario.findOne({
      where: { idMateriaUsuario: inscripcion.idMateriaUsuario },
      include: [
        { model: Materia, as: "materia" },
        { model: Evento, as: "eventos", include: [{ model: Modalidad, as: "modalidad" }] }
      ]
    });
    
    res.status(201).json(inscripcionCompleta);
  } catch (error) {
    console.error("Error al inscribir materia:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Obtener todas las inscripciones (materias inscritas) de un usuario
app.get("/db/materias", async (req, res) => {
  try {
    const idUsuario = req.query.idUsuario;
    if (!idUsuario) {
      return res.status(400).json({ error: "No se especificó el ID de usuario" });
    }
    const inscripciones = await MateriaUsuario.findAll({
      where: { idUsuario },
      include: [
        { model: Materia, as: "materia" },
        { model: Evento, as: "eventos", include: [{ model: Modalidad, as: "modalidad" }] }
      ]
    });
    res.json(inscripciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Obtener una inscripción en particular por ID (con materia y eventos)
app.get("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inscripcion = await MateriaUsuario.findOne({
      where: { idMateriaUsuario: id },
      include: [
        { model: Materia, as: "materia" },
        { model: Evento, as: "eventos", include: [{ model: Modalidad, as: "modalidad" }] }
      ]
    });
    if (!inscripcion) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    res.json(inscripcion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Actualizar una inscripción y sus eventos
app.put("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inscripcion = await MateriaUsuario.findByPk(id);
    if (!inscripcion) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    
    const { NombreMateria, anio, horario, modalidad, correlativas, eventos, idUsuario } = req.body;
    
    // Actualiza la materia global asociada (si se suministran nuevos datos)
    let materia = await Materia.findOne({ where: { idMateria: inscripcion.idMateria } });
    if (NombreMateria) {
      await materia.update({ NombreMateria, anio, horario, modalidad, correlativas });
    }
    
    // Actualiza la inscripción (puede actualizar idUsuario si es necesario)
    await inscripcion.update({ idUsuario });
    
    // Actualiza los eventos: elimina los existentes y crea los nuevos
    if (eventos && Array.isArray(eventos)) {
      await Evento.destroy({ where: { idMateriaUsuario: id } });
      for (const evt of eventos) {
        await Evento.create({
          tipo: evt.tipo,
          anioDeCarrera: evt.anioDeCarrera,
          anio: evt.anio,
          idModalidad: evt.idModalidad,
          dia: evt.dia,
          horaInicio: evt.horaInicio,
          horaFin: evt.horaFin,
          fechaExamen: evt.fechaExamen,
          notaParcial1: evt.notaParcial1,
          notaParcial2: evt.notaParcial2,
          notaFinal: evt.notaFinal,
          idMateriaUsuario: id
        });
      }
    }
    
    const inscripcionActualizada = await MateriaUsuario.findOne({
      where: { idMateriaUsuario: id },
      include: [
        { model: Materia, as: "materia" },
        { model: Evento, as: "eventos", include: [{ model: Modalidad, as: "modalidad" }] }
      ]
    });
    
    res.json(inscripcionActualizada);
  } catch (error) {
    console.error("Error al actualizar la inscripción:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Eliminar una inscripción (y sus eventos)
app.delete("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Evento.destroy({ where: { idMateriaUsuario: id } });
    const rowsDeleted = await MateriaUsuario.destroy({ where: { idMateriaUsuario: id } });
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*===========================================
  Endpoints para la Tabla Global de Materia
============================================*/

// GET: Listar todas las materias globales
app.get("/db/materias/global", async (req, res) => {
  try {
    const materias = await Materia.findAll();
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear una nueva materia global
app.post("/db/materia/global", async (req, res) => {
  try {
    const { NombreMateria, anio, horario, modalidad, correlativas } = req.body;
    if (!NombreMateria) {
      return res.status(400).json({ error: "El campo NombreMateria es obligatorio" });
    }
    const materia = await Materia.create({ NombreMateria, anio, horario, modalidad, correlativas });
    res.status(201).json(materia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*===========================================
  Endpoints para la Tabla de Modalidad
============================================*/

// GET: Listar todas las modalidades
app.get("/db/modalidades", async (req, res) => {
  try {
    const modalidades = await Modalidad.findAll();
    res.json(modalidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear una modalidad (por ejemplo Presencial, Virtual, Híbrido)
app.post("/db/modalidades", async (req, res) => {
  try {
    const { Nombre } = req.body;
    if (!Nombre) {
      return res.status(400).json({ error: "El campo Nombre es obligatorio" });
    }
    const modalidad = await Modalidad.create({ Nombre });
    res.status(201).json(modalidad);
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
