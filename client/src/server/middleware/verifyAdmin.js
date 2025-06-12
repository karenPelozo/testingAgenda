module.exports = function verifyAdmin(req, res, next) {
  // 1) ¿viene un user desde authenticateToken?
  if (!req.user) {
    return res
      .status(401)
      .json({ error: 'No autenticado. Falta token o token inválido.' });
  }

  // 2) ¿es administrador?
  if (req.user.rol?.toLowerCase() !== 'administrador') {
    return res
      .status(403)
      .json({ error: 'Acceso denegado. No eres administrador.' });
  }

  // 3) todo OK → siguiente handler
  next();
};
