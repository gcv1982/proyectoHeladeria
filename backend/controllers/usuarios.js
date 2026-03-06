
const db = require('../db');
const bcrypt = require('bcrypt');

exports.listarUsuarios = async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, email, rol FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

exports.obtenerUsuarioPorId = async (req, res) => {
  const id = parseInt(req.params.id);
  const rol = req.usuario.rol;
  const idUsuario = req.usuario.id;

  if (rol !== 'admin' && id !== idUsuario) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const result = await db.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

exports.crearUsuario = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
      [nombre, email, password_hash, rol]
    );
    res.json({ mensaje: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

exports.actualizarUsuario = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, email, password, rol } = req.body;

  try {
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const campos = [];
    const valores = [];
    let paramCount = 1;

    if (nombre) {
      campos.push(`nombre = $${paramCount}`);
      valores.push(nombre);
      paramCount++;
    }
    if (email) {
      campos.push(`email = $${paramCount}`);
      valores.push(email);
      paramCount++;
    }
    if (rol) {
      campos.push(`rol = $${paramCount}`);
      valores.push(rol);
      paramCount++;
    }
    if (password_hash) {
      campos.push(`password_hash = $${paramCount}`);
      valores.push(password_hash);
      paramCount++;
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    valores.push(id);
    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${paramCount}`;
    await db.query(sql, valores);

    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};