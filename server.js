
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

// Importa el middleware de autorización desde la carpeta middleware
const verifyAdmin = require('./client/src/server/middleware/verifyAdmin');

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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

// Registro de Usuario (auto-registro público)
// Se evita que se autorregistre un usuario con rol de "administrador"
app.post("/register", async (req, res) => {
  try {
    const { nombre, password, rol } = req.body;
    if (!nombre || !password || !rol) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    // Evita el registro de administradores desde la interfaz pública
    if (rol.toLowerCase() === "administrador" || rol.toLowerCase() === "admin") {
      return res.status(403).json({ error: "No se permite el auto-registro de administradores" });
    }
    const newUser = await createUser(req.body);
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
    // Nota: En producción se debería generar un token o establecer sesión.
    res.json({ message: "Login exitoso", user: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*===========================================
  Endpoint para obtener Usuarios (Administración)
===========================================*/

// GET para listar todos los usuarios (protegido para administradores)
app.get("/db/usuarios", verifyAdmin, async (req, res) => {
  try {
    const usuarios = await User.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*===========================================
  Endpoints para Inscripciones de Materias y Eventos
===========================================*/

app.post("/db/materia", async (req, res) => {
  try {
    const { NombreMateria, eventos, idUsuario } = req.body;
    if (!NombreMateria || !idUsuario) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Buscar o crear la materia global
    let materia = await Materia.findOne({ where: { NombreMateria } });
    if (!materia) {
      materia = await Materia.create({ NombreMateria });
    }
    
    // Crear la inscripción
    const inscripcion = await MateriaUsuario.create({
      idMateria: materia.idMateria,
      idUsuario
    });
    
    // Crear eventos asociados
    if (eventos && Array.isArray(eventos)) {
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
          idMateriaUsuario: inscripcion.idMateriaUsuario
        });
      }
    }
    
    // Retornar la inscripción completa con joins
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

app.put("/db/materia/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inscripcion = await MateriaUsuario.findByPk(id, {
      include: [{ model: Materia, as: "materia" }]
    });
    if (!inscripcion) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }
    const { NombreMateria, eventos, idUsuario } = req.body;
    if (NombreMateria && inscripcion.materia.NombreMateria !== NombreMateria) {
      let materiaNueva = await Materia.findOne({ where: { NombreMateria } });
      if (!materiaNueva) {
        materiaNueva = await Materia.create({ NombreMateria });
      }
      await inscripcion.update({ idUsuario, idMateria: materiaNueva.idMateria });
    } else {
      await inscripcion.update({ idUsuario });
    }
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

app.get("/db/materias/global", async (req, res) => {
  try {
    const materias = await Materia.findAll();
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get("/db/modalidades", async (req, res) => {
  try {
    const modalidades = await Modalidad.findAll();
    res.json(modalidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// GET: Obtener correlativas para una materia dada
app.get("/db/correlativas/:idMateria", async (req, res) => {
  try {
    const { idMateria } = req.params;
    const materia = await Materia.findByPk(idMateria, {
      include: [{ model: Materia, as: "correlativas" }]
    });
    if (!materia) return res.status(404).json({ error: "Materia no encontrada" });
    res.json(materia.correlativas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*===========================================
  Función auxiliar para crear usuarios
===========================================*/

async function createUser(userData) {
  const { nombre, password, rol } = userData;
  
  if (!nombre || !password || !rol) {
    throw new Error("Faltan campos obligatorios");
  }
  
  const existingUser = await User.findOne({ where: { nombre } });
  if (existingUser) {
    throw new Error("El usuario ya existe");
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = await User.create({
    nombre,
    password: hashedPassword,
    rol,
  });
  
  return newUser;
}

/*===========================================
  Endpoints para Usuarios (Administración)
===========================================*/

app.get("/db/usuarios/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NOTA: Este endpoint permite crear usuarios, incluido administradores, SOLO si se pasa el middleware verifyAdmin.
app.post("/db/usuarios", verifyAdmin, async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json({ message: "Usuario creado", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/db/usuarios/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const rowsDeleted = await User.destroy({ where: { id } });
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/db/usuarios/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rol, password } = req.body;

    // Verificar que el usuario existe
    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Construir los datos a actualizar
    const datosActualizados = { nombre, rol };

    // Si el usuario ingresó una nueva contraseña, la hasheamos
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      datosActualizados.password = hashedPassword;
    }

    // Actualizar los datos en la BD
    await usuario.update(datosActualizados);

    res.json({ message: "Usuario actualizado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



/*===========================================
  Sincronización de la Base de Datos y Arranque del Servidor
===========================================*/

sequelize.sync()
  .then(() => {
    console.log("Base de datos y tablas creadas correctamente.");
    app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
  })
  .catch((error) => {
    console.error("Error al sincronizar la base de datos:", error);
  });
