const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;

// Importa la conexión de Sequelize y los modelos
const sequelize = require('./client/Data/db');
const User = require('./client/models/User');
const { Materia, Modalidad, MateriaUsuario, Evento } = require('./client/models/index');

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "public")));

// Ruta raíz: enviar index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "public", "index.html"));
});

/*===========================================
  Endpoints para Usuarios
===========================================*/

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
===========================================*/

// POST: Guardar una inscripción y registrar sus eventos
app.post("/db/materia", async (req, res) => {
  try {
    /*
      Se espera recibir un JSON similar a:
      {
        "NombreMateria": "Matemática 1",
        "eventos": [
          {
            "tipo": "Examen 1",
            "anioDeCarrera": 1,
            "anio": 2025,
            "dia": "Lunes",
            "horaInicio": "09:00",
            "horaFin": "11:00",
            "correlativas": "Matemática Básica, Física 1",
            "fechaExamen": "2025-06-15",
            "notaParcial1": 8.5,
            "notaParcial2": 7.0,
            "notaFinal": 8.75,
            "idModalidad": 1
          }
          // Se pueden incluir más eventos
        ],
        "idUsuario": 2
      }
    */
    const { NombreMateria, eventos, idUsuario } = req.body;
    if (!NombreMateria || !idUsuario) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Buscar o crear la materia global (la tabla Materia tiene sólo NombreMateria)
    let materia = await Materia.findOne({ where: { NombreMateria } });
    if (!materia) {
      materia = await Materia.create({ NombreMateria });
    }
    
    // Crear la inscripción en la tabla MateriaUsuario
    const inscripcion = await MateriaUsuario.create({
      idMateria: materia.idMateria,
      idUsuario
    });
    
    // Crear cada uno de los eventos asociados a esta inscripción
    if (eventos && Array.isArray(eventos)) {
      for (const evt of eventos) {
        await Evento.create({
          tipo: evt.tipo,
          anioDeCarrera: evt.anioDeCarrera,
          anio: evt.anio,
          // Eliminamos "horario" y usamos horaInicio y horaFin
          horaInicio: evt.horaInicio,
          horaFin: evt.horaFin,
          correlativas: evt.correlativas,
          fechaExamen: evt.fechaExamen,
          notaParcial1: evt.notaParcial1,
          notaParcial2: evt.notaParcial2,
          notaFinal: evt.notaFinal,
          dia: evt.dia,
          idModalidad: evt.idModalidad,
          idMateriaUsuario: inscripcion.idMateriaUsuario
        });
      }
    }
    
    // Recupera la inscripción completa (un join con Materia y los Eventos, que incluyen Modalidad)
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

// GET: Obtener todas las inscripciones (con sus eventos) de un usuario
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

// GET: Obtener una inscripción (con sus eventos) por el ID de la inscripción
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
// PUT: Actualizar una inscripción y sus eventos.
app.put("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Incluir la materia actual en la consulta para comparar el nombre
    const inscripcion = await MateriaUsuario.findByPk(id, {
      include: [{ model: Materia, as: "materia" }]
    });
    if (!inscripcion) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    
    const { NombreMateria, eventos, idUsuario } = req.body;
    
    // Si se ingresó un nuevo NombreMateria distinto del que ya tiene la inscripción,
    // buscamos (o creamos) la materia sin modificar la existente.
    if (NombreMateria && inscripcion.materia.NombreMateria !== NombreMateria) {
      let materiaNueva = await Materia.findOne({ where: { NombreMateria } });
      if (!materiaNueva) {
        materiaNueva = await Materia.create({ NombreMateria });
      }
      // Actualizamos la inscripción para que apunte al registro de "Algebra" (o el nuevo nombre)
      await inscripcion.update({ idUsuario, idMateria: materiaNueva.idMateria });
    } else {
      // Si el nombre no ha cambiado, solo actualizamos el idUsuario (en caso de ser necesario)
      await inscripcion.update({ idUsuario });
    }
    
    // Actualizar los eventos: eliminamos los existentes y creamos los nuevos
    if (eventos && Array.isArray(eventos)) {
      await Evento.destroy({ where: { idMateriaUsuario: id } });
      for (const evt of eventos) {
        await Evento.create({
          tipo: evt.tipo,
          anioDeCarrera: evt.anioDeCarrera,
          anio: evt.anio,
          horaInicio: evt.horaInicio,
          horaFin: evt.horaFin,
          correlativas: evt.correlativas,
          fechaExamen: evt.fechaExamen,
          notaParcial1: evt.notaParcial1,
          notaParcial2: evt.notaParcial2,
          notaFinal: evt.notaFinal,
          dia: evt.dia,
          idModalidad: evt.idModalidad,
          idMateriaUsuario: id,
          numero: evt.numero,
          temasAEstudiar: evt.temasAEstudiar,
          estado: evt.estado,
          fechaEntrega: evt.fechaEntrega
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


// DELETE: Eliminar una inscripción y sus eventos
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
===========================================*/

// GET: Listar todas las materias globales
app.get("/db/materias/global", async (req, res) => {
  try {
    const materias = await Materia.findAll();
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear una nueva materia global (solo el nombre)
app.post("/db/materia/global", async (req, res) => {
  try {
    const { NombreMateria } = req.body;
    if (!NombreMateria) {
      return res.status(400).json({ error: "El campo NombreMateria es obligatorio" });
    }
    const materia = await Materia.create({ NombreMateria });
    res.status(201).json(materia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*===========================================
  Endpoints para la Tabla de Modalidad
===========================================*/

// GET: Listar todas las modalidades
app.get("/db/modalidades", async (req, res) => {
  try {
    const modalidades = await Modalidad.findAll();
    res.json(modalidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear una modalidad (por ejemplo, Presencial, Virtual, Híbrido)
// Se asume que el modelo Modalidad utiliza la columna "tipoModalidad"
app.post("/db/modalidades", async (req, res) => {
  try {
    const { tipoModalidad } = req.body;
    if (!tipoModalidad) {
      return res.status(400).json({ error: "El campo tipoModalidad es obligatorio" });
    }
    const modalidad = await Modalidad.create({ tipoModalidad });
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
