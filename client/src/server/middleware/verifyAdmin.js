// middleware/verifyAdmin.js

/**
 * Middleware para verificar que el usuario tenga rol de administrador.
 * Para pruebas se puede usar un header (x-admin) o, en producción, 
 * verificarse que req.user esté asignado y tenga rol "administrador".
 */
module.exports = function verifyAdmin(req, res, next) {
  // Para pruebas, si se envía el header "x-admin": "true", se acepta la petición.
  if (req.headers["x-admin"] === "true") {
    return next();
  }
  
  // En un entorno real, se supone que el middleware de autenticación ya asigna req.user.
  if (req.user && req.user.rol && req.user.rol.toLowerCase() === "administrador") {
    return next();
  }
  
  return res.status(403).json({ error: "Acceso denegado, no eres administrador." });
};
