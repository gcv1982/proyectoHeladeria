
const jwt = require('jsonwebtoken');
require('dotenv').config();

const claveSecreta = process.env.JWT_SECRET;
if (!claveSecreta) {
  console.error('❌ JWT_SECRET no definido en .env');
  process.exit(1);
}

exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const usuario = jwt.verify(token, claveSecreta);
    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

exports.verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.rol;
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
    }
    next();
  };
};