
// controllers/productos.js
const db = require('../db');

exports.crearProducto = async (req, res) => {
  const { nombre, presentacion, precio_unitario, categoria, observaciones } = req.body;
  try {
    await db.query(
      'INSERT INTO productos (nombre, presentacion, precio_unitario, categoria, observaciones) VALUES ($1, $2, $3, $4, $5)',
      [nombre, presentacion, precio_unitario, categoria, observaciones]
    );
    res.status(201).json({ mensaje: 'Producto creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto', detalle: err });
  }
};

exports.listarProductos = async (req, res) => {
  try {
    const todos = req.query.todos === 'true';
    const query = todos
      ? 'SELECT * FROM productos ORDER BY categoria, nombre'
      : 'SELECT * FROM productos WHERE activo = TRUE ORDER BY categoria, nombre';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar productos', detalle: err });
  }
};

exports.editarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio_unitario, categoria, observaciones } = req.body;
  try {
    const result = await db.query(
      `UPDATE productos SET nombre=$1, precio_unitario=$2, categoria=$3, observaciones=$4 WHERE id=$5 RETURNING *`,
      [nombre, precio_unitario, categoria, observaciones || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ success: true, producto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar producto', detalle: err });
  }
};

exports.desactivarProducto = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    const result = await db.query(
      'UPDATE productos SET activo=$1 WHERE id=$2 RETURNING *',
      [activo, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ success: true, producto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto', detalle: err });
  }
};