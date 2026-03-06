
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const initDB = require('./initDB');

const app = express();
const rutas = require('./routes');
const db = require('./db');

// Probar conexión a BD
(async () => {
  try {
    const result = await db.query('SELECT 1');
    console.log('✅ Conexión a la base de datos exitosa');
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
})();

// Inicializar tablas de BD
initDB().catch(err => console.error('Error en inicialización de BD:', err));

// Configurar CORS para React (localhost:3000, 3001) y otros orígenes
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002', 'http://localhost:5500', 'http://127.0.0.1:5500'];

// Configurar CORS usando el paquete cors
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use('/api', rutas);

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

app.listen(5000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:5000');
});
