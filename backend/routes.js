
const express = require('express');
const router = express.Router();
const { listarProductos } = require('./controllers/productos.js');
const { verificarToken, verificarRol } = require('./middlewares/auth');
const { login } = require('./controllers/auth');
const {
    listarUsuarios,
    obtenerUsuarioPorId,
    crearUsuario
} = require('./controllers/usuarios');

const { actualizarUsuario } = require('./controllers/usuarios');

const { eliminarUsuario } = require('./controllers/usuarios');

const {
    crearVenta,
    obtenerVentas,
    obtenerVentaPorId,
    obtenerReporteVentas,
    cancelarVenta
} = require('./controllers/ventas');

// ========== AUTENTICACIÓN ==========
router.post('/login', login);

// ========== USUARIOS ==========
router.get('/usuarios', verificarToken, verificarRol(['admin']), listarUsuarios);
router.put('/usuarios/:id', verificarToken, verificarRol(['admin']), actualizarUsuario);
router.post('/usuarios', verificarToken, verificarRol(['admin']), crearUsuario);
router.delete('/usuarios/:id', verificarToken, verificarRol(['admin']), eliminarUsuario);

// ========== PRODUCTOS ==========
router.get('/productos', verificarToken, listarProductos);

// ========== VENTAS ==========
// Crear nueva venta
router.post('/ventas', verificarToken, crearVenta);

// Obtener todas las ventas (con filtros opcionales)
router.get('/ventas', verificarToken, obtenerVentas);

// Obtener venta por ID
router.get('/ventas/:id', verificarToken, obtenerVentaPorId);

// Obtener reporte de ventas
router.get('/ventas-reporte', verificarToken, obtenerReporteVentas);

// Cancelar venta
router.put('/ventas/:id/cancelar', verificarToken, cancelarVenta);


module.exports = router;