const db = require('../db');

// Abrir turno
exports.abrirTurno = async (req, res) => {
  try {
    const { usuario_id } = req.body;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id requerido' });

    // Si ya tiene un turno abierto, devolvemos ese
    const abierto = await db.query(
      "SELECT * FROM turnos WHERE usuario_id = $1 AND estado = 'abierto' ORDER BY fecha_inicio DESC LIMIT 1",
      [usuario_id]
    );
    if (abierto.rows.length > 0) {
      return res.json({ success: true, turno: abierto.rows[0], yaExistia: true });
    }

    const result = await db.query(
      "INSERT INTO turnos (usuario_id, estado, fecha_inicio) VALUES ($1, 'abierto', NOW()) RETURNING *",
      [usuario_id]
    );
    res.status(201).json({ success: true, turno: result.rows[0] });
  } catch (error) {
    console.error('Error al abrir turno:', error);
    res.status(500).json({ error: 'Error al abrir turno', details: error.message });
  }
};

// Cerrar turno
exports.cerrarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE turnos SET estado = 'cerrado', fecha_fin = NOW() WHERE id = $1 AND estado = 'abierto' RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Turno no encontrado o ya cerrado' });
    }
    res.json({ success: true, turno: result.rows[0] });
  } catch (error) {
    console.error('Error al cerrar turno:', error);
    res.status(500).json({ error: 'Error al cerrar turno', details: error.message });
  }
};

// Obtener turno activo de un usuario
exports.obtenerTurnoActivo = async (req, res) => {
  try {
    const { usuario_id } = req.query;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id requerido' });

    const result = await db.query(
      `SELECT t.*, u.nombre AS usuario_nombre,
         COALESCE((
           SELECT SUM(v.total) FROM ventas v
           WHERE v.usuario_id = t.usuario_id
             AND v.fecha >= t.fecha_inicio
             AND v.estado != 'cancelada'
         ), 0) AS total_ventas,
         COALESCE((
           SELECT COUNT(*) FROM ventas v
           WHERE v.usuario_id = t.usuario_id
             AND v.fecha >= t.fecha_inicio
             AND v.estado != 'cancelada'
         ), 0) AS cantidad_ventas
       FROM turnos t
       LEFT JOIN usuarios u ON t.usuario_id = u.id
       WHERE t.usuario_id = $1 AND t.estado = 'abierto'
       ORDER BY t.fecha_inicio DESC LIMIT 1`,
      [usuario_id]
    );
    res.json({ success: true, turno: result.rows[0] || null });
  } catch (error) {
    console.error('Error al obtener turno activo:', error);
    res.status(500).json({ error: 'Error al obtener turno', details: error.message });
  }
};

// Historial de turnos (admin)
exports.obtenerHistorialTurnos = async (req, res) => {
  try {
    const { limite = 50, fecha } = req.query;

    let whereClause = '';
    const params = [parseInt(limite)];

    if (fecha) {
      // Filtrar por fecha (día completo en hora local AR UTC-3)
      whereClause = `WHERE t.fecha_inicio::date = ($2::date)`;
      params.push(fecha);
    }

    const result = await db.query(
      `SELECT
         t.*,
         u.nombre AS usuario_nombre,
         COALESCE((
           SELECT SUM(v.total) FROM ventas v
           WHERE v.usuario_id = t.usuario_id
             AND v.fecha >= t.fecha_inicio
             AND (t.fecha_fin IS NULL OR v.fecha <= t.fecha_fin)
             AND v.estado != 'cancelada'
         ), 0) AS total_ventas,
         COALESCE((
           SELECT COUNT(*) FROM ventas v
           WHERE v.usuario_id = t.usuario_id
             AND v.fecha >= t.fecha_inicio
             AND (t.fecha_fin IS NULL OR v.fecha <= t.fecha_fin)
             AND v.estado != 'cancelada'
         ), 0) AS cantidad_ventas
       FROM turnos t
       LEFT JOIN usuarios u ON t.usuario_id = u.id
       ${whereClause}
       ORDER BY t.fecha_inicio DESC
       LIMIT $1`,
      params
    );
    res.json({ success: true, turnos: result.rows });
  } catch (error) {
    console.error('Error al obtener historial de turnos:', error);
    res.status(500).json({ error: 'Error al obtener historial', details: error.message });
  }
};

// Detalle de ventas de un turno
exports.obtenerVentasTurno = async (req, res) => {
  try {
    const { id } = req.params;

    const turnoRes = await db.query('SELECT * FROM turnos WHERE id = $1', [id]);
    if (turnoRes.rows.length === 0) return res.status(404).json({ error: 'Turno no encontrado' });

    const turno = turnoRes.rows[0];
    const ventasRes = await db.query(
      `SELECT v.*, u.nombre AS usuario_nombre FROM ventas v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       WHERE v.usuario_id = $1
         AND v.fecha >= $2
         AND ($3::timestamp IS NULL OR v.fecha <= $3)
         AND v.estado != 'cancelada'
       ORDER BY v.fecha ASC`,
      [turno.usuario_id, turno.fecha_inicio, turno.fecha_fin]
    );
    res.json({ success: true, turno, ventas: ventasRes.rows });
  } catch (error) {
    console.error('Error al obtener ventas del turno:', error);
    res.status(500).json({ error: 'Error al obtener ventas', details: error.message });
  }
};
