// auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'clavesecreta';

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token faltante' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
