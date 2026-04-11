
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('../db');
require('dotenv').config();

const claveSecreta = process.env.JWT_SECRET;
if (!claveSecreta) {
  console.error('❌ JWT_SECRET no definido en .env — el servidor no puede iniciar de forma segura');
  process.exit(1);
}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuarios = result.rows;
    
    if (usuarios.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = usuarios[0];
    const esValida = await bcrypt.compare(password, usuario.password_hash);
    if (!esValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      },
      claveSecreta,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};