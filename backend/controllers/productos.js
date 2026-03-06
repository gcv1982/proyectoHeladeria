
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
    const result = await db.query('SELECT * FROM productos WHERE activo = TRUE');
    const productos = result.rows;
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar productos', detalle: err });
  }
};