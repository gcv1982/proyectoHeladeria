
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { useAuth } from './AuthContext';
import Login from './Login';

import CajaView from './components/CajaView';
import RetirosView from './components/RetirosView';
import GestionProductos from './components/GestionProductos';
import GestionUsuarios from './components/GestionUsuarios';
import HistorialCajas from './components/HistorialCajas';
import HistorialTurnos from './components/HistorialTurnos';
import MiTurno from './components/MiTurno';
import Dashboard from './components/Dashboard';
import ComparativaView from './components/ComparativaView';
import ModalPago from './components/ModalPago';
import VentaConfirmada from './components/VentaConfirmada';
import ModalEditarVenta from './components/ModalEditarVenta';
import POSView from './components/POSView';

import { fechaLocal, calcularResumenCaja, calcularMetricasMedios } from './utils/reportes';
import { printTicket, imprimirReporteCierre } from './utils/impresion';

const API_URL = '/api';

function AppInner() {
  const { user, token, role, logout } = useAuth();

  // ── Estado de productos ────────────────────────────────────────────────────
  const [productos, setProductos] = useState([]);
  const [todosProductos, setTodosProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio_unitario: '', categoria: 'GRANEL' });
  const [productoEditando, setProductoEditando] = useState(null);

  // ── Estado de usuarios ─────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', password: '', rol: 'vendedor' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [nuevaPasswordEdit, setNuevaPasswordEdit] = useState('');

  // ── Estado de historial de cajas / turnos ──────────────────────────────────
  const [historialCajas, setHistorialCajas] = useState([]);
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [historialTurnos, setHistorialTurnos] = useState([]);
  const [turnoDetalle, setTurnoDetalle] = useState(null);

  const categorias = ['GRANEL', 'POSTRES', 'CUCURUCHOS', 'PALITOS', 'TORTAS', 'FAMILIARES', 'TENTACIONES', 'BATIDOS', 'BEBIDAS', 'PROMOCIONES', 'EXTRAS', 'PIZZAS', 'SIN TACC', 'CHOCOLATES'];

  // ── Estado del POS ─────────────────────────────────────────────────────────
  const [carrito, setCarrito] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  // ── Estado de navegación ───────────────────────────────────────────────────
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [mostrarRetiros, setMostrarRetiros] = useState(false);
  const [mostrarCaja, setMostrarCaja] = useState(false);
  const [mostrarComparativa, setMostrarComparativa] = useState(false);
  const [mostrarGestionProductos, setMostrarGestionProductos] = useState(false);
  const [mostrarGestionUsuarios, setMostrarGestionUsuarios] = useState(false);
  const [mostrarHistorialCajas, setMostrarHistorialCajas] = useState(false);
  const [mostrarMiTurno, setMostrarMiTurno] = useState(false);
  const [mostrarHistorialTurnos, setMostrarHistorialTurnos] = useState(false);

  // ── Estado del pago / venta ────────────────────────────────────────────────
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [pagosSeleccionados, setPagosSeleccionados] = useState([]);
  const [ventaConfirmada, setVentaConfirmada] = useState(null);
  const [ventaEditando, setVentaEditando] = useState(null);
  const [productoAgregarEdit, setProductoAgregarEdit] = useState('');

  // ── Estado de caja ─────────────────────────────────────────────────────────
  const [cajaAbierta, setCajaAbierta] = useState(() => localStorage.getItem('cajaAbierta') === 'true');
  const [inicioCaja, setInicioCaja] = useState(() => {
    try { const s = localStorage.getItem('inicioCaja'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [cajaId, setCajaId] = useState(() => {
    const s = localStorage.getItem('cajaId'); return s ? parseInt(s) : null;
  });
  const [cierreKey, setCierreKey] = useState(0);
  const [cierreTotalContado, setCierreTotalContado] = useState(() => {
    try {
      const s = localStorage.getItem('cierre-denominaciones');
      if (s) {
        const vals = JSON.parse(s);
        const config = [20000,10000,2000,1000,500,200,100,50,20,10];
        const keys = ['d20000','d10000','d2000','d1000','d500','d200','d100','d50','d20','d10'];
        return keys.reduce((acc, k, i) => acc + (Number(vals[k]) || 0) * config[i], 0);
      }
    } catch(e) {}
    return 0;
  });

  const denomInicioRef = useRef();
  const denomCierreRef = useRef();

  // ── Estado de retiros / gastos ─────────────────────────────────────────────
  const [retiros, setRetiros] = useState([]);
  const [nuevoRetiroMonto, setNuevoRetiroMonto] = useState('');
  const [nuevoRetiroDesc, setNuevoRetiroDesc] = useState('');
  const [retiroEditandoIdx, setRetiroEditandoIdx] = useState(null);
  const [editandoMonto, setEditandoMonto] = useState('');
  const [editandoDesc, setEditandoDesc] = useState('');

  const [ingresoMonto, setIngresoMonto] = useState('');
  const [ingresoDesc, setIngresoDesc] = useState('');
  const [ingresoMetodo, setIngresoMetodo] = useState('EFECTIVO');

  const [gastos, setGastos] = useState([]);
  const [nuevoGastoMonto, setNuevoGastoMonto] = useState('');
  const [nuevoGastoDesc, setNuevoGastoDesc] = useState('');

  // ── Estado del dashboard ───────────────────────────────────────────────────
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('HOY');
  const [ventasDelDia, setVentasDelDia] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [detalleDashboard, setDetalleDashboard] = useState(null);
  const [calMes, setCalMes] = useState(new Date().getMonth());
  const [calAño, setCalAño] = useState(new Date().getFullYear());

  const isAdmin = role && typeof role === 'string' && role.toLowerCase().includes('admin');

  // ── Helpers ────────────────────────────────────────────────────────────────
  const generarPasswordAleatoria = () => {
    const adj = ['verde','dulce','rapido','fuerte','lindo','nuevo'];
    const num = Math.floor(100 + Math.random() * 900);
    return adj[Math.floor(Math.random() * adj.length)] + num;
  };

  const exportarRetirosCSV = () => {
    if (retiros.length === 0) { alert('No hay retiros para exportar'); return; }
    const headers = ['fecha','descripcion','monto','usuario'];
    const rows = retiros.map(r => [new Date(r.fecha).toISOString(), (r.descripcion||''), r.monto, (r.usuario||'')]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `retiros-${new Date().toISOString().slice(0,10)}.csv`; a.style.display='none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const navClear = () => {
    setMostrarDashboard(false); setMostrarCaja(false); setMostrarRetiros(false);
    setMostrarGestionProductos(false); setMostrarGestionUsuarios(false);
    setMostrarHistorialCajas(false); setMostrarMiTurno(false); setMostrarHistorialTurnos(false);
    setMostrarComparativa(false);
  };

  // ── Efectos ────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedGastos = localStorage.getItem('gastos');
      if (storedGastos) setGastos(JSON.parse(storedGastos));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('gastos', JSON.stringify(gastos)); } catch (e) {}
  }, [retiros, gastos]);

  useEffect(() => {
    try {
      const open = localStorage.getItem('cajaAbierta') === 'true';
      const inicio = localStorage.getItem('inicioCaja');
      const idCaja = localStorage.getItem('cajaId');
      setCajaAbierta(open);
      setInicioCaja(inicio ? JSON.parse(inicio) : null);
      if (idCaja) setCajaId(Number(idCaja));
      if (!open) setMostrarCaja(false);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (user) {
      if (!cajaAbierta) setMostrarCaja(true);
    } else {
      setMostrarCaja(false); setMostrarDashboard(false);
    }
  }, [user, cajaAbierta]);

  useEffect(() => {
    if (user && token) {
      const hoy = new Date();
      apiCargarVentasDelDia(hoy.getMonth(), hoy.getFullYear());
      cargarRetiros();
      cargarProductos();
      cargarCajaDesdeDB();
      abrirTurno();
    }
  }, [user, token]); // eslint-disable-line

  useEffect(() => {
    if (user && token && mostrarDashboard) {
      apiCargarVentasDelDia(calMes, calAño);
      const intervalo = setInterval(() => apiCargarVentasDelDia(calMes, calAño), 30000);
      return () => clearInterval(intervalo);
    }
  }, [user, token, mostrarDashboard, calMes, calAño]); // eslint-disable-line

  // ── API: Caja ──────────────────────────────────────────────────────────────
  const cargarCajaDesdeDB = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/cajas/abierta`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (!res.ok) return;
      const data = await res.json();
      if (data.caja) {
        const caja = data.caja;
        setCajaId(caja.id);
        setCajaAbierta(true);
        const denoms = caja.denominaciones_inicio || {};
        const montoInicial = parseFloat(caja.monto_inicial) || 0;
        const datosCaja = { fecha: caja.fecha_apertura, montoInicial, denominaciones: denoms };
        setInicioCaja(datosCaja);
        localStorage.setItem('cajaAbierta', 'true');
        localStorage.setItem('cajaId', String(caja.id));
        localStorage.setItem('inicioCaja', JSON.stringify(datosCaja));
      } else {
        setCajaAbierta(false); setCajaId(null); setInicioCaja(null);
        localStorage.removeItem('cajaAbierta'); localStorage.removeItem('cajaId'); localStorage.removeItem('inicioCaja');
      }
    } catch (e) { console.error('Error al cargar caja desde DB:', e); }
  };

  const confirmarInicioCaja = async () => {
    const total = denomInicioRef.current?.getTotal() ?? 0;
    if (total === 0) { alert('Debe ingresar al menos una denominación'); return; }
    const v = denomInicioRef.current.getValues();
    const denominaciones = { billete20000: v.d20000, billete10000: v.d10000, billete2000: v.d2000, billete1000: v.d1000, billete500: v.d500, billete200: v.d200, billete100: v.d100, moneda50: v.d50, moneda20: v.d20, moneda10: v.d10 };
    const datosCaja = { fecha: new Date().toISOString(), montoInicial: total, denominaciones, iniciadoPor: user?.username ?? null };
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/cajas/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
        body: JSON.stringify({ usuario_id: user.id, monto_inicial: total, denominaciones_inicio: denominaciones })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Error al abrir caja'); return; }
      setCajaId(data.caja.id);
      localStorage.setItem('cajaId', String(data.caja.id));
    } catch (e) { alert('Error de conexión al abrir caja'); return; }
    setInicioCaja(datosCaja);
    setCajaAbierta(true);
    setMostrarCaja(false);
    localStorage.setItem('cajaAbierta', 'true');
    localStorage.setItem('inicioCaja', JSON.stringify(datosCaja));
    alert(`Caja abierta exitosamente\nMonto inicial: $${total.toLocaleString()}`);
  };

  const confirmarCierreCaja = async () => {
    const resumen = calcularResumenCaja(inicioCaja, ventasDelDia, retiros, gastos, cierreTotalContado);
    const tokenActual = localStorage.getItem('auth_token');
    const idCaja = cajaId || localStorage.getItem('cajaId');
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const fechaDesdeApertura = inicioCaja?.fecha ? fechaLocal(inicioCaja.fecha) : fechaHoy;
    const ventasHoy = ventasDelDia.filter(v => fechaLocal(v.fecha) >= fechaDesdeApertura && v.estado !== 'cancelada');

    if (idCaja) {
      try {
        const denomCierre = denomCierreRef.current?.getValues() || {};
        await fetch(`${API_URL}/cajas/${idCaja}/cerrar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
          body: JSON.stringify({ monto_cierre: resumen.totalReal, denominaciones_cierre: denomCierre, diferencia: resumen.diferencia, total_ventas: resumen.totalVentas, total_retiros: resumen.retiros, total_gastos: resumen.gastos })
        });
      } catch (e) { console.error('Error al cerrar caja en BD:', e); }
    }

    if (window.confirm('¿Querés imprimir el reporte de cierre?')) {
      imprimirReporteCierre(resumen, ventasHoy, retiros, inicioCaja);
    }

    // Enviar resumen por email al admin
    try {
      const medios = calcularMetricasMedios(ventasHoy);
      await fetch(`${API_URL}/email/resumen-cierre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
        body: JSON.stringify({
          fecha: new Date().toISOString(),
          resumen,
          ventasPorMedio: medios.lista,
          retiros,
          gastos,
        }),
      });
    } catch (e) { console.error('Error al enviar email de cierre:', e); }

    setCajaAbierta(false); setMostrarCaja(false); setCajaId(null);
    setCierreKey(k => k + 1); setCierreTotalContado(0);
    setVentasDelDia([]); setInicioCaja(null); setRetiros([]); setGastos([]);
    localStorage.removeItem('cajaAbierta'); localStorage.removeItem('inicioCaja');
    localStorage.removeItem('cajaId'); localStorage.removeItem('retiros');
    localStorage.removeItem('gastos'); localStorage.removeItem('cierre-denominaciones');
  };

  const cargarHistorialCajas = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/cajas/historial?limite=50`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) { const data = await res.json(); setHistorialCajas(data.cajas || []); }
    } catch (e) { console.error('Error al cargar historial de cajas:', e); }
  };

  // ── API: Turnos ────────────────────────────────────────────────────────────
  const abrirTurno = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual || !user) return;
    try {
      const res = await fetch(`${API_URL}/turnos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenActual}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id })
      });
      if (res.ok) { const data = await res.json(); setTurnoActivo(data.turno); }
    } catch (e) { console.error('Error al abrir turno:', e); }
  };

  const cerrarTurno = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual || !turnoActivo) return;
    try {
      await fetch(`${API_URL}/turnos/${turnoActivo.id}/cerrar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${tokenActual}` } });
      setTurnoActivo(null);
    } catch (e) { console.error('Error al cerrar turno:', e); }
  };

  const cargarTurnoActivo = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual || !user) return;
    try {
      const res = await fetch(`${API_URL}/turnos/activo?usuario_id=${user.id}`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) { const data = await res.json(); setTurnoActivo(data.turno); }
    } catch (e) { console.error('Error al cargar turno:', e); }
  };

  const cargarHistorialTurnos = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/turnos/historial?limite=60`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) { const data = await res.json(); setHistorialTurnos(data.turnos || []); }
    } catch (e) { console.error('Error al cargar historial de turnos:', e); }
  };

  const cargarDetalleTurno = async (turnoId) => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/turnos/${turnoId}/ventas`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) { const data = await res.json(); setTurnoDetalle(data); }
    } catch (e) { console.error('Error al cargar detalle de turno:', e); }
  };

  // ── API: Usuarios ──────────────────────────────────────────────────────────
  const cargarUsuarios = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) setUsuarios(await res.json());
    } catch (e) { console.error('Error al cargar usuarios:', e); }
  };

  const crearUsuario = async () => {
    const { nombre, email, password, rol } = nuevoUsuario;
    if (!nombre.trim() || !email.trim() || !password.trim()) { alert('Completá nombre, email y contraseña.'); return; }
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenActual}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rol })
      });
      if (res.ok) {
        alert(`✅ Usuario "${nombre}" creado.\nContraseña: ${password}`);
        setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'vendedor' });
        cargarUsuarios();
      } else { const err = await res.json(); alert('Error: ' + (err.error || 'No se pudo crear el usuario')); }
    } catch (e) { alert('Error de conexión'); }
  };

  const guardarEdicionUsuario = async () => {
    if (!usuarioEditando) return;
    const tokenActual = localStorage.getItem('auth_token');
    const body = { nombre: usuarioEditando.nombre, email: usuarioEditando.email, rol: usuarioEditando.rol };
    if (nuevaPasswordEdit.trim()) body.password = nuevaPasswordEdit.trim();
    try {
      const res = await fetch(`${API_URL}/usuarios/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${tokenActual}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        if (nuevaPasswordEdit.trim()) alert(`✅ Usuario actualizado.\nNueva contraseña: ${nuevaPasswordEdit.trim()}`);
        setUsuarioEditando(null); setNuevaPasswordEdit(''); cargarUsuarios();
      } else { const err = await res.json(); alert('Error: ' + (err.error || 'No se pudo actualizar')); }
    } catch (e) { alert('Error de conexión'); }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) cargarUsuarios();
      else alert('Error al eliminar usuario');
    } catch (e) { alert('Error de conexión'); }
  };

  // ── API: Productos ─────────────────────────────────────────────────────────
  const cargarProductos = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/productos`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) { const data = await res.json(); setProductos(data.map(p => ({ ...p, precio: parseFloat(p.precio_unitario) }))); }
    } catch (e) { console.error('Error al cargar productos:', e); }
  };

  const cargarTodosProductos = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/productos?todos=true`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) { const data = await res.json(); setTodosProductos(data); }
    } catch (e) { console.error('Error:', e); }
  };

  const guardarProducto = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    const { nombre, precio_unitario, categoria } = nuevoProducto;
    if (!nombre.trim() || !precio_unitario || !categoria) { alert('Completá todos los campos'); return; }
    try {
      const res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
        body: JSON.stringify({ nombre, precio_unitario: parseFloat(precio_unitario), categoria })
      });
      if (res.ok) {
        await cargarProductos(); await cargarTodosProductos();
        setNuevoProducto({ nombre: '', precio_unitario: '', categoria: 'GRANEL' });
      } else { alert('Error al guardar producto'); }
    } catch (e) { alert('Error de conexión'); }
  };

  const guardarEdicionProducto = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    const { id, nombre, precio_unitario, categoria } = productoEditando;
    if (!nombre.trim() || !precio_unitario) { alert('Completá todos los campos'); return; }
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
        body: JSON.stringify({ nombre, precio_unitario: parseFloat(precio_unitario), categoria })
      });
      if (res.ok) { await cargarProductos(); await cargarTodosProductos(); setProductoEditando(null); }
      else { alert('Error al editar producto'); }
    } catch (e) { alert('Error de conexión'); }
  };

  const toggleActivoProducto = async (producto) => {
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/productos/${producto.id}/activo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
        body: JSON.stringify({ activo: !producto.activo })
      });
      if (res.ok) { await cargarProductos(); await cargarTodosProductos(); }
      else alert('Error al actualizar producto');
    } catch (e) { alert('Error de conexión'); }
  };

  // ── API: Ventas ────────────────────────────────────────────────────────────
  const apiGuardarVenta = async (venta) => {
    if (!user || !token) { alert('Error: No hay sesión activa.'); return false; }
    try {
      const response = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ usuario_id: user.id, items: venta.items, total: venta.total, pagos: venta.pagos, descripcion: `Venta de ${venta.items.length} productos` })
      });
      if (!response.ok) { const error = await response.json(); alert(`Error: ${error.error || 'No se pudo guardar la venta'}`); return false; }
      const data = await response.json();
      return data.venta_id;
    } catch (error) { alert(`Error de conexión: ${error.message}`); return null; }
  };

  const apiModificarVenta = async (id, items, total, pagos) => {
    if (!user || !token) return false;
    try {
      const response = await fetch(`${API_URL}/ventas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items, total, pagos })
      });
      if (!response.ok) {
        const text = await response.text();
        try { const err = JSON.parse(text); alert(`Error: ${err.error || 'No se pudo modificar la venta'}`); }
        catch { alert(`Error del servidor (${response.status}).`); }
        return false;
      }
      return true;
    } catch (error) { alert('No se pudo conectar con el servidor.'); return false; }
  };

  const eliminarVenta = async (id) => {
    if (!window.confirm('¿Estás seguro que querés eliminar esta venta?')) return;
    try {
      const response = await fetch(`${API_URL}/ventas/${id}/cancelar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setVentasDelDia(prev => prev.filter(v => v.id !== id));
      else alert('No se pudo eliminar la venta.');
    } catch { alert('Error de conexión.'); }
  };

  const abrirEdicionVenta = (venta) => {
    setVentaEditando({
      id: venta.id,
      items: (venta.items || []).map(it => ({ ...it, cantidad: Number(it.cantidad) })),
      pagos: (venta.pagos || []).map(p => ({ ...p, monto: Number(p.monto) }))
    });
    setProductoAgregarEdit('');
  };

  const guardarEdicionVenta = async () => {
    const totalItems = ventaEditando.items.reduce((s, it) => s + (it.precio * it.cantidad), 0);
    const totalPagos = ventaEditando.pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
    if (ventaEditando.items.length === 0) { alert('Debe haber al menos un producto'); return; }
    if (ventaEditando.pagos.length === 0) { alert('Debe haber al menos un medio de pago'); return; }
    if (Math.abs(totalItems - totalPagos) > 0.01) { alert(`Los totales no coinciden`); return; }
    const ok = await apiModificarVenta(ventaEditando.id, ventaEditando.items, totalItems, ventaEditando.pagos);
    if (ok) {
      setVentasDelDia(prev => prev.map(v => v.id === ventaEditando.id ? { ...v, items: ventaEditando.items, pagos: ventaEditando.pagos, total: totalItems } : v));
      setVentaEditando(null);
    }
  };

  const apiCargarVentasDelDia = async (mesVer = calMes, añoVer = calAño) => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!user || !tokenActual) return;
    try {
      const ultimoDia = new Date(añoVer, mesVer + 1, 0).getDate();
      const fechaInicio = `${añoVer}-${String(mesVer + 1).padStart(2, '0')}-01`;
      const fechaFin = `${añoVer}-${String(mesVer + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
      const response = await fetch(`${API_URL}/ventas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (!response.ok) {
        if (response.status === 403) { alert('Tu sesión expiró. Por favor volvé a iniciar sesión.'); logout(); }
        return;
      }
      const data = await response.json();
      if (data && Array.isArray(data.ventas)) {
        setVentasDelDia(data.ventas.map(v => {
          let items = v.items, pagos = v.pagos;
          try { items = typeof items === 'string' ? JSON.parse(items) : (items || []); } catch { items = []; }
          try { pagos = typeof pagos === 'string' ? JSON.parse(pagos) : (pagos || []); } catch { pagos = []; }
          return { ...v, items, pagos };
        }));
      }
    } catch (error) { console.error('Error al obtener ventas:', error); }
  };

  // ── API: Retiros ───────────────────────────────────────────────────────────
  const cargarRetiros = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const hoy = new Date();
      const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
      const res = await fetch(`${API_URL}/retiros?fecha_inicio=${fecha}&fecha_fin=${fecha}`, { headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) { const data = await res.json(); setRetiros(data.retiros || []); }
    } catch (e) { console.error('Error al cargar retiros:', e); }
  };

  const agregarRetiro = async () => {
    const monto = parseFloat(nuevoRetiroMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido para el retiro'); return; }
    const hoyStr = (() => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`; })();
    const fechaDesdeApertura = inicioCaja?.fecha ? fechaLocal(inicioCaja.fecha) : hoyStr;
    const montoDisponible = (inicioCaja ? inicioCaja.montoInicial : 0) +
      ventasDelDia.filter(v => fechaLocal(v.fecha) >= fechaDesdeApertura).reduce((s, v) => {
        const ef = (v.pagos || []).reduce((ps, p) => p.metodo === 'EFECTIVO' ? ps + (parseFloat(p.monto) || 0) : ps, 0);
        return s + ef;
      }, 0) - retiros.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
    if (monto > montoDisponible) { alert(`El monto excede el efectivo disponible ($${montoDisponible.toLocaleString()}).`); return; }
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/retiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
        body: JSON.stringify({ usuario_id: user.id, monto, descripcion: nuevoRetiroDesc || 'Retiro' })
      });
      if (res.ok) { await cargarRetiros(); setNuevoRetiroMonto(''); setNuevoRetiroDesc(''); }
      else { alert('Error al guardar el retiro'); }
    } catch (e) { alert('Error de conexión'); }
  };

  const iniciarEdicionRetiro = (idx) => {
    if (!isAdmin) { alert('No tiene permisos para editar retiros'); return; }
    setRetiroEditandoIdx(idx); setEditandoMonto(String(retiros[idx].monto)); setEditandoDesc(retiros[idx].descripcion || '');
  };

  const guardarEdicionRetiro = (idx) => {
    if (!isAdmin) { alert('No tiene permisos para editar retiros'); return; }
    const monto = parseFloat(editandoMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido'); return; }
    const copia = [...retiros];
    copia[idx] = { ...copia[idx], monto, descripcion: editandoDesc || 'Retiro' };
    setRetiros(copia); setRetiroEditandoIdx(null); setEditandoMonto(''); setEditandoDesc('');
  };

  const cancelarEdicionRetiro = () => { setRetiroEditandoIdx(null); setEditandoMonto(''); setEditandoDesc(''); };

  const eliminarRetiro = async (idx) => {
    if (!isAdmin) { alert('No tiene permisos para eliminar retiros'); return; }
    if (!window.confirm('¿Eliminar este retiro?')) return;
    const retiro = retiros[idx];
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/retiros/${retiro.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenActual}` } });
      if (res.ok) await cargarRetiros();
      else alert('Error al eliminar el retiro');
    } catch (e) { alert('Error de conexión'); }
  };

  // ── Gastos (local) ─────────────────────────────────────────────────────────
  const agregarGasto = () => {
    const monto = parseFloat(nuevoGastoMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido para el gasto'); return; }
    const nuevo = { monto, descripcion: nuevoGastoDesc || 'Gasto', fecha: new Date().toISOString(), usuario: user?.nombre || null };
    setGastos([...gastos, nuevo]);
    setNuevoGastoMonto(''); setNuevoGastoDesc('');
    alert(`Gasto registrado: $${monto.toLocaleString()}`);
  };

  const eliminarGasto = (idx) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    const copia = [...gastos]; copia.splice(idx, 1); setGastos(copia);
  };

  // ── Ingreso extra ──────────────────────────────────────────────────────────
  const guardarIngresoExtra = () => {
    const monto = parseFloat(ingresoMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido para el ingreso'); return; }
    const nuevaVenta = { id: Date.now(), fecha: new Date().toISOString(), items: [], total: monto, pagos: [{ metodo: ingresoMetodo, monto }], descripcion: ingresoDesc || 'Ingreso extra', usuario: user?.nombre || null };
    setVentasDelDia([...ventasDelDia, nuevaVenta]);
    setIngresoMonto(''); setIngresoDesc(''); setIngresoMetodo('EFECTIVO');
    alert(`Ingreso registrado: $${monto.toLocaleString()} (${ingresoMetodo})`);
  };

  // ── Carrito ────────────────────────────────────────────────────────────────
  const agregarAlCarrito = (producto) => {
    if (!cajaAbierta) { alert('Debe abrir la caja antes de realizar ventas.'); setMostrarCaja(true); return; }
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const limpiarCarrito = () => setCarrito([]);

  const eliminarSeleccionado = () => {
    if (seleccionado === null) return;
    const item = carrito.find(item => item.id === seleccionado);
    if (!item) return;
    if (item.cantidad > 1) {
      setCarrito(carrito.map(p => p.id === seleccionado ? { ...p, cantidad: p.cantidad - 1 } : p));
    } else {
      setCarrito(carrito.filter(p => p.id !== seleccionado));
      setSeleccionado(null);
    }
  };

  const cobrar = () => {
    if (!cajaAbierta) { alert('Debe abrir la caja antes de cobrar.'); setMostrarCaja(true); return; }
    if (carrito.length === 0) { alert('El carrito está vacío'); return; }
    setMostrarModalPago(true);
  };

  // ── Pago ───────────────────────────────────────────────────────────────────
  const agregarMetodoPago = (metodo) => {
    const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    if (pagosSeleccionados.length === 0) {
      setPagosSeleccionados([{ metodo, monto: totalVenta }]);
    } else {
      const montoRestante = totalVenta - pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0);
      setPagosSeleccionados([...pagosSeleccionados, { metodo, monto: montoRestante }]);
    }
  };

  const quitarMetodoPago = (index) => setPagosSeleccionados(pagosSeleccionados.filter((_, i) => i !== index));

  const actualizarMontoPago = (index, nuevoMonto) => {
    const actualizado = [...pagosSeleccionados];
    actualizado[index].monto = parseFloat(nuevoMonto) || 0;
    setPagosSeleccionados(actualizado);
  };

  const confirmarVenta = async () => {
    const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalPagos = pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0);
    if (Math.abs(totalPagos - totalVenta) > 0.01) { alert(`El total de pagos no coincide con el total de la venta`); return; }
    const ventaBase = {
      fecha: new Date().toISOString(),
      items: carrito.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
      total: totalVenta,
      pagos: pagosSeleccionados.map(p => ({ metodo: p.metodo, monto: p.monto }))
    };
    const ventaId = await apiGuardarVenta(ventaBase);
    if (!ventaId) { alert('Error: No se pudo guardar la venta. Intente de nuevo.'); return; }
    const nuevaVenta = { ...ventaBase, id: ventaId };
    setVentasDelDia([...ventasDelDia, nuevaVenta]);
    setVentaConfirmada(nuevaVenta);
    setMostrarModalPago(false);
  };

  const cancelarVenta = () => { setMostrarModalPago(false); setPagosSeleccionados([]); };

  const cerrarResumenVenta = () => {
    setVentaConfirmada(null); setPagosSeleccionados([]); limpiarCarrito(); setSeleccionado(null); setCategoriaActiva(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="App">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', maxWidth: '1400px', margin: '0 auto 30px', gap: '12px' }}>
        <h1 style={{ margin: 0, marginRight: '8px', fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/favicon-32x32.png" alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden' }} />
          Grido Laspiur
        </h1>
        <div className="header-actions" style={{ display: 'flex', gap: 0, alignItems: 'center', marginLeft: 'auto' }}>
          <nav className="main-nav" style={{ display: 'flex', gap: '6px' }}>
            <button className={`nav-btn ${mostrarDashboard ? 'active' : ''}`} onClick={() => { navClear(); setMostrarDashboard(true); }}>Dashboard</button>
            <button className={`nav-btn ${mostrarCaja ? 'active' : ''}`} onClick={() => { navClear(); setMostrarCaja(true); }}>Caja</button>
            <button className={`nav-btn ${mostrarRetiros ? 'active' : ''}`} onClick={() => { navClear(); setMostrarRetiros(true); }}>Retiros</button>
            <button className="nav-btn" onClick={() => { navClear(); setCategoriaActiva(null); }}>Productos</button>
            <button className={`nav-btn ${mostrarMiTurno ? 'active' : ''}`} onClick={() => { navClear(); setMostrarMiTurno(true); cargarTurnoActivo(); }}>Mi Turno</button>
            {isAdmin && <button className={`nav-btn ${mostrarGestionProductos ? 'active' : ''}`} onClick={() => { navClear(); setMostrarGestionProductos(true); cargarTodosProductos(); }}>Gestión</button>}
            {isAdmin && <button className={`nav-btn ${mostrarGestionUsuarios ? 'active' : ''}`} onClick={() => { navClear(); setMostrarGestionUsuarios(true); cargarUsuarios(); }}>Usuarios</button>}
            {isAdmin && <button className={`nav-btn ${mostrarHistorialCajas ? 'active' : ''}`} onClick={() => { navClear(); setMostrarHistorialCajas(true); cargarHistorialCajas(); }}>Cajas</button>}
            {isAdmin && <button className={`nav-btn ${mostrarHistorialTurnos ? 'active' : ''}`} onClick={() => { navClear(); setMostrarHistorialTurnos(true); setTurnoDetalle(null); cargarHistorialTurnos(); }}>Turnos</button>}
            {isAdmin && <button className={`nav-btn ${mostrarComparativa ? 'active' : ''}`} onClick={() => { navClear(); setMostrarComparativa(true); }}>Comparativa</button>}
          </nav>
          <div className="header-right" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button className={`btn-open-caja ${cajaAbierta ? 'open' : ''}`} onClick={() => { navClear(); setMostrarCaja(true); }}>{cajaAbierta ? '💰 Caja Abierta' : '💰 Abrir Caja'}</button>
            {user && (
              <>
                <div className="usuario-info">{user.nombre}</div>
                <button className="btn-logout" onClick={() => {
                  localStorage.removeItem('retiros'); localStorage.removeItem('gastos');
                  cerrarTurno(); logout();
                }}>Cerrar sesión</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vistas */}
      {mostrarCaja ? (
        <CajaView
          cajaAbierta={cajaAbierta} inicioCaja={inicioCaja} isAdmin={isAdmin}
          denomInicioRef={denomInicioRef} denomCierreRef={denomCierreRef}
          cierreKey={cierreKey} setCierreTotalContado={setCierreTotalContado} cierreTotalContado={cierreTotalContado}
          nuevoRetiroMonto={nuevoRetiroMonto} setNuevoRetiroMonto={setNuevoRetiroMonto}
          nuevoRetiroDesc={nuevoRetiroDesc} setNuevoRetiroDesc={setNuevoRetiroDesc}
          ingresoMonto={ingresoMonto} setIngresoMonto={setIngresoMonto}
          ingresoDesc={ingresoDesc} setIngresoDesc={setIngresoDesc}
          ingresoMetodo={ingresoMetodo} setIngresoMetodo={setIngresoMetodo}
          nuevoGastoMonto={nuevoGastoMonto} setNuevoGastoMonto={setNuevoGastoMonto}
          nuevoGastoDesc={nuevoGastoDesc} setNuevoGastoDesc={setNuevoGastoDesc}
          retiros={retiros} gastos={gastos} retiroEditandoIdx={retiroEditandoIdx}
          editandoMonto={editandoMonto} setEditandoMonto={setEditandoMonto}
          editandoDesc={editandoDesc} setEditandoDesc={setEditandoDesc}
          ventasDelDia={ventasDelDia}
          agregarRetiro={agregarRetiro} eliminarRetiro={eliminarRetiro}
          iniciarEdicionRetiro={iniciarEdicionRetiro} guardarEdicionRetiro={guardarEdicionRetiro}
          cancelarEdicionRetiro={cancelarEdicionRetiro}
          guardarIngresoExtra={guardarIngresoExtra}
          agregarGasto={agregarGasto} eliminarGasto={eliminarGasto}
          exportarRetirosCSV={exportarRetirosCSV}
          confirmarInicioCaja={confirmarInicioCaja} confirmarCierreCaja={confirmarCierreCaja}
          setMostrarCaja={setMostrarCaja}
        />
      ) : mostrarRetiros ? (
        <RetirosView
          retiros={retiros}
          nuevoRetiroMonto={nuevoRetiroMonto} setNuevoRetiroMonto={setNuevoRetiroMonto}
          nuevoRetiroDesc={nuevoRetiroDesc} setNuevoRetiroDesc={setNuevoRetiroDesc}
          retiroEditandoIdx={retiroEditandoIdx}
          editandoMonto={editandoMonto} setEditandoMonto={setEditandoMonto}
          editandoDesc={editandoDesc} setEditandoDesc={setEditandoDesc}
          isAdmin={isAdmin}
          agregarRetiro={agregarRetiro} eliminarRetiro={eliminarRetiro}
          iniciarEdicionRetiro={iniciarEdicionRetiro} guardarEdicionRetiro={guardarEdicionRetiro}
          cancelarEdicionRetiro={cancelarEdicionRetiro}
          exportarRetirosCSV={exportarRetirosCSV}
        />
      ) : mostrarGestionUsuarios && isAdmin ? (
        <GestionUsuarios
          usuarios={usuarios} nuevoUsuario={nuevoUsuario} setNuevoUsuario={setNuevoUsuario}
          usuarioEditando={usuarioEditando} setUsuarioEditando={setUsuarioEditando}
          nuevaPasswordEdit={nuevaPasswordEdit} setNuevaPasswordEdit={setNuevaPasswordEdit}
          crearUsuario={crearUsuario} guardarEdicionUsuario={guardarEdicionUsuario}
          eliminarUsuario={eliminarUsuario} generarPasswordAleatoria={generarPasswordAleatoria}
          currentUserId={user?.id}
        />
      ) : mostrarGestionProductos && isAdmin ? (
        <GestionProductos
          todosProductos={todosProductos} nuevoProducto={nuevoProducto} setNuevoProducto={setNuevoProducto}
          productoEditando={productoEditando} setProductoEditando={setProductoEditando}
          categorias={categorias}
          guardarProducto={guardarProducto} guardarEdicionProducto={guardarEdicionProducto}
          toggleActivoProducto={toggleActivoProducto}
        />
      ) : mostrarHistorialCajas && isAdmin ? (
        <HistorialCajas historialCajas={historialCajas} />
      ) : mostrarMiTurno ? (
        <MiTurno turnoActivo={turnoActivo} ventasDelDia={ventasDelDia} user={user} />
      ) : mostrarHistorialTurnos && isAdmin ? (
        <HistorialTurnos
          historialTurnos={historialTurnos} turnoDetalle={turnoDetalle}
          setTurnoDetalle={setTurnoDetalle} cargarDetalleTurno={cargarDetalleTurno}
        />
      ) : mostrarComparativa ? (
        <ComparativaView ventasDelDia={ventasDelDia} />
      ) : mostrarDashboard ? (
        <Dashboard
          ventasDelDia={ventasDelDia}
          periodoSeleccionado={periodoSeleccionado} setPeriodoSeleccionado={setPeriodoSeleccionado}
          detalleDashboard={detalleDashboard} setDetalleDashboard={setDetalleDashboard}
          diaSeleccionado={diaSeleccionado} setDiaSeleccionado={setDiaSeleccionado}
          calMes={calMes} setCalMes={setCalMes} calAño={calAño} setCalAño={setCalAño}
          isAdmin={isAdmin} abrirEdicionVenta={abrirEdicionVenta} eliminarVenta={eliminarVenta}
        />
      ) : (
        <POSView
          categorias={categorias} categoriaActiva={categoriaActiva} setCategoriaActiva={setCategoriaActiva}
          productos={productos} agregarAlCarrito={agregarAlCarrito}
          carrito={carrito} seleccionado={seleccionado} setSeleccionado={setSeleccionado}
          cobrar={cobrar} eliminarSeleccionado={eliminarSeleccionado} limpiarCarrito={limpiarCarrito}
        />
      )}

      {/* Modales */}
      {mostrarModalPago && (
        <ModalPago
          carrito={carrito} pagosSeleccionados={pagosSeleccionados}
          agregarMetodoPago={agregarMetodoPago} quitarMetodoPago={quitarMetodoPago}
          actualizarMontoPago={actualizarMontoPago}
          confirmarVenta={confirmarVenta} cancelarVenta={cancelarVenta}
        />
      )}
      {ventaConfirmada && (
        <VentaConfirmada
          ventaConfirmada={ventaConfirmada}
          cerrarResumenVenta={cerrarResumenVenta}
          printTicket={printTicket}
        />
      )}
      {ventaEditando && (
        <ModalEditarVenta
          ventaEditando={ventaEditando} setVentaEditando={setVentaEditando}
          productos={productos}
          productoAgregarEdit={productoAgregarEdit} setProductoAgregarEdit={setProductoAgregarEdit}
          guardarEdicionVenta={guardarEdicionVenta}
        />
      )}
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return <AppInner />;
}
