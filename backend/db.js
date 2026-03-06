
// db.js
const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'ProyectoProgramaHeladeria',
};

// Solo agregar password si existe
if (process.env.DB_PASSWORD) {
  dbConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(dbConfig);

// Probar conexión inicial
const masked = { ...dbConfig };
if (masked.password) masked.password = '****';
console.log('🔧 Configuración de BD utilizada:', masked);

pool.on('connect', () => {
  console.log('✅ Conexión a PostgreSQL establecida');
});

pool.on('error', (err) => {
  console.error('❌ Error en pool de PostgreSQL:', err);
});

module.exports = pool;
