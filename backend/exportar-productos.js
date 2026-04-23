require('dotenv').config();
const db = require('./db');
const fs = require('fs');

db.query('SELECT nombre, precio_unitario, categoria, activo FROM productos WHERE activo = true ORDER BY categoria, nombre')
  .then(r => {
    const inserts = r.rows.map(p =>
      `INSERT INTO productos (nombre, precio_unitario, categoria, activo) VALUES ('${p.nombre.replace(/'/g, "''")}', ${p.precio_unitario}, '${p.categoria}', ${p.activo});`
    ).join('\n');
    const ruta = require('path').join(__dirname, 'productos_export.sql');
    fs.writeFileSync(ruta, inserts);
    console.log('Ruta:', ruta);
    console.log('Exportado: ' + r.rows.length + ' productos -> productos_export.sql');
    process.exit();
  })
  .catch(e => { console.error(e); process.exit(1); });
