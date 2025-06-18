const User =  require('../../../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "clavesecreta";
const controllersUser = {}
const login= async(req , res)=>{
    const user = req.user;
    const { nombre, password } = req.body;
    const payload = { id: user.id, nombre: user.nombre, rol: user.rol };
    if (!user) {
         return res.status(401).json({ error: "Usuario no autenticado a través del middleware." });
    }
     const token = jwt.sign(payload, SECRET, { expiresIn: "2h" });
     
     res.json({ message: "Login exitoso", token, user: payload });
}
controllersUser.login= login;
// GET para listar todos los usuarios (protegido para administradores)

const todosUsuarioProtegidosAD = async (req, res) => {
  try {
    const usuarios = await User.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
controllersUser.todosUsuarioProtegidosAD = todosUsuarioProtegidosAD
/*===========================================
  Endpoints para Usuarios (Administración)
===========================================*/

const usuarioPorID = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByPk(id);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
controllersUser.usuarioPorID = usuarioPorID ;

// NOTA: Este endpoint permite crear usuarios, incluido administradores, SOLO si se pasa el middleware verifyAdmin.

const createUsuarioAD = async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json({ message: "Usuario creado", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
controllersUser.createUsuarioAD = createUsuarioAD;
const eliminarUsuario = async (req, res) => {
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
}
controllersUser.eliminarUsuario = eliminarUsuario;
const actualizacionUsuarioDatos =  async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rol, password } = req.body;
    const usuario = await User.findByPk(id);
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
}
controllersUser.actualizacionUsuarioDatos = actualizacionUsuarioDatos;
async function createUser(userData) {
  const { nombre, password, rol } = userData;
  const existingUser = await User.findOne({ where: { nombre } });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    nombre,
    password: hashedPassword,
    rol,
  });
  return newUser;
}

module.exports = controllersUser;