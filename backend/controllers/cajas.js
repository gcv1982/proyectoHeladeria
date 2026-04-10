const db = require('../db');

// Abrir caja
exports.abrirCaja = async (req, res) => {
  try {
    const { usuario_id, monto_inicial, denominaciones_inicio } = req.body;
    if (!usuario_id || monto_inicial === undefined) {
      return res.status(400).json({ error: 'usuario_id y monto_inicial son requeridos' });
    }
    // Verificar si ya hay una caja abierta
    const abierta = await db.query("SELECT id FROM cajas WHERE estado = 'abierta' LIMIT 1");
    if (abierta.rows.length > 0) {
      return res.status(400).json({ error: 'Ya hay una caja abierta' });
    }
    const result = await db.query(
      `INSERT INTO cajas (usuario_id, monto_inicial, denominaciones_inicio, estado, fecha_apertura)
       VALUES ($1, $2, $3, 'abierta', NOW()) RETURNING *`,
      [usuario_id, monto_inicial, JSON.stringify(denominaciones_inicio || {})]
    );
    res.status(201).json({ success: true, caja: result.rows[0] });
  } catch (error) {
    console.error('Error al abrir caja:', error);
    res.status(500).json({ error: 'Error al abrir caja', details: error.message });
  }
};

// Cerrar caja
exports.cerrarCaja = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto_cierre, denominaciones_cierre, diferencia, total_ventas, total_retiros, total_gastos } = req.body;
    const result = await db.query(
      `UPDATE cajas SET
         estado = 'cerrada',
         monto_cierre = $1,
         denominaciones_cierre = $2,
         diferencia = $3,
         fecha_cierre = NOW()
       WHERE id = $4 AND estado = 'abierta'
       RETURNING *`,
      [monto_cierre, JSON.stringify(denominaciones_cierre || {}), diferencia, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Caja no encontrada o ya cerrada' });
    }
    res.json({ success: true, caja: result.rows[0] });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ error: 'Error al cerrar caja', details: error.message });
  }
};

// Obtener caja abierta
exports.obtenerCajaAbierta = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM cajas WHERE estado = 'abierta' ORDER BY fecha_apertura DESC LIMIT 1");
    if (result.rows.length === 0) {
      return res.json({ success: true, caja: null });
    }
    const caja = result.rows[0];
    if (caja.denominaciones_inicio && typeof caja.denominaciones_inicio === 'string') {
      caja.denominaciones_inicio = JSON.parse(caja.denominaciones_inicio);
    }
    res.json({ success: true, caja });
  } catch (error) {
    console.error('Error al obtener caja abierta:', error);
    res.status(500).json({ error: 'Error al obtener caja', details: error.message });
  }
};

// Obtener historial de cajas
exports.obtenerHistorialCajas = async (req, res) => {
  try {
    const { limite = 30 } = req.query;
    const result = await db.query(
      `SELECT
         c.*,
         u.nombre AS usuario_nombre,
         COALESCE((
           SELECT SUM(v.total)
           FROM ventas v
           WHERE v.fecha >= c.fecha_apertura
             AND (c.fecha_cierre IS NULL OR v.fecha <= c.fecha_cierre)
             AND v.estado != 'cancelada'
         ), 0) AS total_ventas,
         COALESCE((
           SELECT SUM(r.monto)
           FROM retiros r
           WHERE r.fecha >= c.fecha_apertura
             AND (c.fecha_cierre IS NULL OR r.fecha <= c.fecha_cierre)
         ), 0) AS total_retiros
       FROM cajas c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       ORDER BY c.fecha_apertura DESC
       LIMIT $1`,
      [parseInt(limite)]
    );
    res.json({ success: true, cajas: result.rows });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial', details: error.message });
  }
};
