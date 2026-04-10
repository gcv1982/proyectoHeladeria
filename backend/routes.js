
const express = require('express');
const router = express.Router();
const { listarProductos, crearProducto, editarProducto, desactivarProducto } = require('./controllers/productos.js');
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
    cancelarVenta,
    modificarVenta
} = require('./controllers/ventas');

const {
    crearRetiro,
    obtenerRetiros,
    eliminarRetiro
} = require('./controllers/retiros');

// ========== AUTENTICACIÓN ==========
router.post('/login', login);

// ========== USUARIOS ==========
router.get('/usuarios', verificarToken, verificarRol(['admin']), listarUsuarios);
router.put('/usuarios/:id', verificarToken, verificarRol(['admin']), actualizarUsuario);
router.post('/usuarios', verificarToken, verificarRol(['admin']), crearUsuario);
router.delete('/usuarios/:id', verificarToken, verificarRol(['admin']), eliminarUsuario);

// ========== PRODUCTOS ==========
router.get('/productos', verificarToken, listarProductos);
router.post('/productos', verificarToken, verificarRol(['admin']), crearProducto);
router.put('/productos/:id', verificarToken, verificarRol(['admin']), editarProducto);
router.patch('/productos/:id/activo', verificarToken, verificarRol(['admin']), desactivarProducto);

// ========== VENTAS ==========
// Crear nueva venta
router.post('/ventas', verificarToken, crearVenta);

// Obtener todas las ventas (con filtros opcionales)
router.get('/ventas', verificarToken, obtenerVentas);

// Obtener venta por ID
router.get('/ventas/:id', verificarToken, obtenerVentaPorId);

// Obtener reporte de ventas
router.get('/ventas-reporte', verificarToken, obtenerReporteVentas);

// Modificar venta (solo admin/gerente)
router.put('/ventas/:id', verificarToken, verificarRol(['admin', 'gerente']), modificarVenta);

// Cancelar venta
router.put('/ventas/:id/cancelar', verificarToken, cancelarVenta);

// ========== RETIROS ==========
router.post('/retiros', verificarToken, crearRetiro);
router.get('/retiros', verificarToken, obtenerRetiros);
router.delete('/retiros/:id', verificarToken, verificarRol(['admin']), eliminarRetiro);

// ========== TURNOS ==========
const { abrirTurno, cerrarTurno, obtenerTurnoActivo, obtenerHistorialTurnos, obtenerVentasTurno } = require('./controllers/turnos');
router.post('/turnos', verificarToken, abrirTurno);
router.put('/turnos/:id/cerrar', verificarToken, cerrarTurno);
router.get('/turnos/activo', verificarToken, obtenerTurnoActivo);
router.get('/turnos/historial', verificarToken, verificarRol(['admin']), obtenerHistorialTurnos);
router.get('/turnos/:id/ventas', verificarToken, obtenerVentasTurno);

// ========== CAJAS ==========
const { abrirCaja, cerrarCaja, obtenerCajaAbierta, obtenerHistorialCajas } = require('./controllers/cajas');
router.post('/cajas/abrir', verificarToken, abrirCaja);
router.put('/cajas/:id/cerrar', verificarToken, verificarRol(['admin']), cerrarCaja);
router.get('/cajas/abierta', verificarToken, obtenerCajaAbierta);
router.get('/cajas/historial', verificarToken, verificarRol(['admin']), obtenerHistorialCajas);

module.exports = router;