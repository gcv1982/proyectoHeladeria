
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const initDB = require('./initDB');

const app = express();
const rutas = require('./routes');
const db = require('./db');

// Probar conexión a BD
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Conexión a la base de datos exitosa');
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
})();

// Inicializar tablas de BD
initDB().catch(err => console.error('Error en inicialización de BD:', err));

// CORS solo para desarrollo (React en puerto 3000)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
}

app.use(express.json());
app.use('/api', rutas);

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Servir el build de React en producción
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// Cualquier ruta que no sea /api devuelve el index.html de React
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});
