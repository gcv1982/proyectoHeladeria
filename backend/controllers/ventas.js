const db = require('../db');

// Guardar venta en la BD
exports.crearVenta = async (req, res) => {
  try {
    const { usuario_id, items, total, pagos, descripcion } = req.body;

    // Validar datos
    if (!usuario_id || !items || !total || !pagos) {
      return res.status(400).json({
        error: 'Campos requeridos: usuario_id, items, total, pagos'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    }

    if (!Array.isArray(pagos) || pagos.length === 0) {
      return res.status(400).json({ error: 'pagos debe ser un array no vacío' });
    }

    // Insertar venta en BD
    const result = await db.query(
      `INSERT INTO ventas (usuario_id, total, items, pagos, descripcion, estado, fecha)
       VALUES ($1, $2, $3, $4, $5, 'completada', NOW())
       RETURNING id`,
      [usuario_id, total, JSON.stringify(items), JSON.stringify(pagos), descripcion || null]
    );

    const venta_id = result.rows[0].id;

    res.status(201).json({
      success: true,
      message: 'Venta guardada correctamente',
      venta_id,
      total
    });
  } catch (error) {
    console.error('Error al guardar venta:', error);
    res.status(500).json({
      error: 'Error al guardar la venta',
      details: error.message
    });
  }
};

// Obtener todas las ventas
exports.obtenerVentas = async (req, res) => {
  try {
    const { usuario_id, fecha_inicio, fecha_fin, limite = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM ventas WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (usuario_id) {
      query += ` AND usuario_id = $${paramCount}`;
      params.push(usuario_id);
      paramCount++;
    }

    if (fecha_inicio) {
      query += ` AND DATE(fecha) >= $${paramCount}`;
      params.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND DATE(fecha) <= $${paramCount}`;
      params.push(fecha_fin);
      paramCount++;
    }

    query += ` ORDER BY fecha DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limite), parseInt(offset));

    const result = await db.query(query, params);
    const ventas = result.rows;

    // Parsear JSON en items y pagos
    const ventasFormateadas = ventas.map(v => {
      let items = v.items;
      let pagos = v.pagos;
      
      try {
        items = typeof items === 'string' && items.trim() ? JSON.parse(items) : items || [];
      } catch (e) {
        items = [];
      }
      
      try {
        pagos = typeof pagos === 'string' && pagos.trim() ? JSON.parse(pagos) : pagos || [];
      } catch (e) {
        pagos = [];
      }
      
      return { ...v, items, pagos };
    });

    res.json({
      success: true,
      cantidad: ventasFormateadas.length,
      ventas: ventasFormateadas
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      error: 'Error al obtener ventas',
      details: error.message
    });
  }
};

// Obtener venta por ID
exports.obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM ventas WHERE id = $1',
      [id]
    );

    const ventas = result.rows;

    if (ventas.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const venta = ventas[0];
    venta.items = typeof venta.items === 'string' ? JSON.parse(venta.items) : venta.items;
    venta.pagos = typeof venta.pagos === 'string' ? JSON.parse(venta.pagos) : venta.pagos;

    res.json({ success: true, venta });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      error: 'Error al obtener la venta',
      details: error.message
    });
  }
};

// Obtener reporte de ventas por periodo
exports.obtenerReporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, usuario_id } = req.query;

    let query = `
      SELECT
        DATE(fecha) as fecha,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_ventas,
        usuario_id
      FROM ventas
      WHERE estado = 'completada'
    `;
    let params = [];
    let paramCount = 1;

    if (usuario_id) {
      query += ` AND usuario_id = $${paramCount}`;
      params.push(usuario_id);
      paramCount++;
    }

    if (fecha_inicio) {
      query += ` AND DATE(fecha) >= $${paramCount}`;
      params.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      query += ` AND DATE(fecha) <= $${paramCount}`;
      params.push(fecha_fin);
      paramCount++;
    }

    query += ' GROUP BY DATE(fecha), usuario_id ORDER BY fecha DESC';

    const result = await db.query(query, params);
    const reporte = result.rows;

    res.json({
      success: true,
      reporte
    });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({
      error: 'Error al obtener reporte',
      details: error.message
    });
  }
};

// Modificar venta (solo admin/gerente — verificado en la ruta)
exports.modificarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, total, pagos } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    }
    if (!pagos || !Array.isArray(pagos) || pagos.length === 0) {
      return res.status(400).json({ error: 'pagos debe ser un array no vacío' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ error: 'total debe ser mayor a cero' });
    }

    const result = await db.query(
      `UPDATE ventas SET items = $1, total = $2, pagos = $3,
       descripcion = $4, updated_at = NOW()
       WHERE id = $5`,
      [
        JSON.stringify(items),
        total,
        JSON.stringify(pagos),
        `Venta modificada - ${items.length} productos`,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({ success: true, message: 'Venta modificada correctamente' });
  } catch (error) {
    console.error('Error al modificar venta:', error);
    res.status(500).json({ error: 'Error al modificar venta', details: error.message });
  }
};

// Cancelar venta
exports.cancelarVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "UPDATE ventas SET estado = 'cancelada' WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({
      success: true,
      message: 'Venta cancelada correctamente'
    });
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    res.status(500).json({
      error: 'Error al cancelar venta',
      details: error.message
    });
  }
};
