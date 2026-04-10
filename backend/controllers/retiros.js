const db = require('../db');

// Crear retiro
exports.crearRetiro = async (req, res) => {
  try {
    const { usuario_id, monto, descripcion } = req.body;
    if (!usuario_id || !monto || monto <= 0) {
      return res.status(400).json({ error: 'usuario_id y monto son requeridos' });
    }
    const result = await db.query(
      `INSERT INTO retiros (usuario_id, monto, descripcion, fecha)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [usuario_id, monto, descripcion || 'Retiro']
    );
    res.status(201).json({ success: true, retiro: result.rows[0] });
  } catch (error) {
    console.error('Error al crear retiro:', error);
    res.status(500).json({ error: 'Error al crear retiro', details: error.message });
  }
};

// Obtener retiros por fecha
exports.obtenerRetiros = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    let query = 'SELECT * FROM retiros WHERE 1=1';
    const params = [];
    let i = 1;
    if (fecha_inicio) { query += ` AND DATE(fecha) >= $${i++}`; params.push(fecha_inicio); }
    if (fecha_fin)    { query += ` AND DATE(fecha) <= $${i++}`; params.push(fecha_fin); }
    query += ' ORDER BY fecha DESC';
    const result = await db.query(query, params);
    res.json({ success: true, retiros: result.rows });
  } catch (error) {
    console.error('Error al obtener retiros:', error);
    res.status(500).json({ error: 'Error al obtener retiros', details: error.message });
  }
};

// Eliminar retiro
exports.eliminarRetiro = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM retiros WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Retiro no encontrado' });
    res.json({ success: true, message: 'Retiro eliminado' });
  } catch (error) {
    console.error('Error al eliminar retiro:', error);
    res.status(500).json({ error: 'Error al eliminar retiro', details: error.message });
  }
};
