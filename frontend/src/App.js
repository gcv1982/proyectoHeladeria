
import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import './App.css';
import { useAuth } from './AuthContext';
import Login from './Login';

const API_URL = 'http://localhost:5000/api';

// ─── Componente de grilla de denominaciones ──────────────────────────────────
// Se define FUERA de AppInner para que tenga su propio ciclo de render.
// Así cada tecla sólo re-renderiza este componente pequeño, no todo AppInner.
const DENOM_CONFIG = [
  { key: 'd20000', label: '💵 $20.000', mult: 20000 },
  { key: 'd10000', label: '💵 $10.000', mult: 10000 },
  { key: 'd2000',  label: '💵 $2.000',  mult: 2000  },
  { key: 'd1000',  label: '💵 $1.000',  mult: 1000  },
  { key: 'd500',   label: '💵 $500',    mult: 500   },
  { key: 'd200',   label: '💵 $200',    mult: 200   },
  { key: 'd100',   label: '💵 $100',    mult: 100   },
  { key: 'd50',    label: '🪙 $50',     mult: 50    },
  { key: 'd20',    label: '🪙 $20',     mult: 20    },
  { key: 'd10',    label: '🪙 $10',     mult: 10    },
];
const DENOM_INIT = { d20000:'', d10000:'', d2000:'', d1000:'', d500:'', d200:'', d100:'', d50:'', d20:'', d10:'' };
const calcDenomTotal = (v) => DENOM_CONFIG.reduce((s, { key, mult }) => s + (Number(v[key])||0)*mult, 0);

function DenomGrid({ prefix, gridClass, totalLabel, onTotalChange, storageKey, ref }) {
  const [vals, setVals] = useState(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return { ...DENOM_INIT, ...JSON.parse(saved) };
      } catch (e) { /* ignorar */ }
    }
    return DENOM_INIT;
  });
  const total = calcDenomTotal(vals);

  useImperativeHandle(ref, () => ({
    getTotal:  () => calcDenomTotal(vals),
    getValues: () => ({ ...vals }),
  }), [vals]);

  // Notificar al padre el total inicial (al montar, por si viene de localStorage)
  useEffect(() => { if (onTotalChange) onTotalChange(total); }, []); // eslint-disable-line

  const handleChange = (key) => (e) => {
    const raw = e.target.value;
    const v = raw === '' ? '' : String(Math.max(0, parseInt(raw, 10) || 0));
    const newVals = { ...vals, [key]: v };
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(newVals)); } catch (_) {}
    }
    setVals(newVals);
    if (onTotalChange) onTotalChange(calcDenomTotal(newVals));
  };

  return (
    <>
      <div className={gridClass}>
        {DENOM_CONFIG.map(({ key, label, mult }) => (
          <div key={key} className="denominacion-item">
            <label htmlFor={`${prefix}-${key}`}>{label}</label>
            <input
              id={`${prefix}-${key}`}
              name={`${prefix}-${key}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={vals[key]}
              onChange={handleChange(key)}
              placeholder="0"
            />
            <span className="subtotal">${((Number(vals[key])||0)*mult).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="total-inicio" style={gridClass === 'denominaciones-grid-cierre' ? {marginTop:'8px', padding:'6px 12px'} : {}}>
        <h3>{totalLabel}:</h3><h2>${total.toLocaleString()}</h2>
      </div>
    </>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function AppInner() {
  const { user, token, role, logout } = useAuth();

  const [productos, setProductos] = useState([]);
  const [mostrarGestionProductos, setMostrarGestionProductos] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio_unitario: '', categoria: 'GRANEL' });

  const categorias = ['GRANEL', 'POSTRES', 'CUCURUCHOS', 'PALITOS', 'TORTAS', 'FAMILIARES', 'TENTACIONES', 'BATIDOS', 'BEBIDAS', 'PROMOCIONES', 'EXTRAS', 'PIZZAS', 'SIN TACC', 'CHOCOLATES'];

  const [carrito, setCarrito] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [mostrarRetiros, setMostrarRetiros] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('HOY');
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [pagosSeleccionados, setPagosSeleccionados] = useState([]);
  const [ventaConfirmada, setVentaConfirmada] = useState(null);
  const [ventaEditando, setVentaEditando] = useState(null);
  const [productoAgregarEdit, setProductoAgregarEdit] = useState('');
  const [mostrarCaja, setMostrarCaja] = useState(false);
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [inicioCaja, setInicioCaja] = useState(null);
  const [cajaId, setCajaId] = useState(null);
  const [ventasDelDia, setVentasDelDia] = useState([]);
  // Refs a los componentes DenomGrid (manejan su propio estado)
  const denomInicioRef = useRef();
  const denomCierreRef = useRef();
  const [cierreTotalContado, setCierreTotalContado] = useState(() => {
    try {
      const saved = localStorage.getItem('cierre-denominaciones');
      if (saved) return calcDenomTotal({ ...DENOM_INIT, ...JSON.parse(saved) });
    } catch(e) {}
    return 0;
  });
  const [cierreKey, setCierreKey] = useState(0); // cambiar para resetear DenomGrid cierre

  const calcularTotalCierre = () => cierreTotalContado;

  // Retiros: registros parciales de retirada de efectivo
  const [retiros, setRetiros] = useState([]);
  const [nuevoRetiroMonto, setNuevoRetiroMonto] = useState('');
  const [nuevoRetiroDesc, setNuevoRetiroDesc] = useState('');

  // Gastos: registros de gastos/egresos del día
  const [gastos, setGastos] = useState([]);
  const [nuevoGastoMonto, setNuevoGastoMonto] = useState('');
  const [nuevoGastoDesc, setNuevoGastoDesc] = useState('');
  const [mostrarFormGastos, setMostrarFormGastos] = useState(false);
  
  // Dashboard: día seleccionado para ver detalles
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [detalleDashboard, setDetalleDashboard] = useState(null); // 'ventas' | 'productos' | null
  const [calMes, setCalMes] = useState(new Date().getMonth());
  const [calAño, setCalAño] = useState(new Date().getFullYear());

  useEffect(() => {
    try {
      const storedGastos = localStorage.getItem('gastos');
      if (storedGastos) setGastos(JSON.parse(storedGastos));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gastos', JSON.stringify(gastos));
    } catch (e) {
      // ignore
    }
  }, [retiros, gastos]);

  const sumarRetiros = () => retiros.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const sumarGastos = () => gastos.reduce((s, g) => s + (parseFloat(g.monto) || 0), 0);

  const [retiroEditandoIdx, setRetiroEditandoIdx] = useState(null);
  const [editandoMonto, setEditandoMonto] = useState('');
  const [editandoDesc, setEditandoDesc] = useState('');
  const [mostrarIngresoForm, setMostrarIngresoForm] = useState(false);
  const [ingresoMonto, setIngresoMonto] = useState('');
  const [ingresoDesc, setIngresoDesc] = useState('');
  const [ingresoMetodo, setIngresoMetodo] = useState('EFECTIVO');

  // Determinar si el usuario tiene permisos de administrador para retiros
  const isAdmin = role && typeof role === 'string' && role.toLowerCase().includes('admin');

  // Convierte una fecha UTC a fecha local en formato YYYY-MM-DD
  const fechaLocal = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // ========== FUNCIONES DE API ==========

  const cargarProductos = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/productos`, {
        headers: { 'Authorization': `Bearer ${tokenActual}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProductos(data.map(p => ({ ...p, precio: parseFloat(p.precio_unitario) })));
      }
    } catch (e) {
      console.error('Error al cargar productos:', e);
    }
  };

  const apiGuardarVenta = async (venta) => {
    if (!user) {
      console.error('❌ No hay usuario en sesión');
      alert('Error: No hay sesión activa. Por favor, inicie sesión.');
      return false;
    }

    if (!token) {
      console.error('❌ No hay token. Usuario:', user);
      alert('Error: Token no disponible. Por favor, cierre sesión y vuelva a iniciar.');
      return false;
    }

    console.log('📤 Guardando venta con usuario:', user.id, 'Token disponible:', token ? '✓' : '✗');

    try {
      const response = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_id: user.id,
          items: venta.items,
          total: venta.total,
          pagos: venta.pagos,
          descripcion: `Venta de ${venta.items.length} productos`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Error HTTP al guardar venta:', response.status, error);
        alert(`Error: ${error.error || 'No se pudo guardar la venta'}`);
        return false;
      }

      const data = await response.json();
      console.log('✅ Venta guardada en BD:', data);
      return data.venta_id;
    } catch (error) {
      console.error('❌ Error de conexión al guardar venta:', error);
      alert(`Error de conexión: ${error.message}`);
      return null;
    }
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
        try {
          const err = JSON.parse(text);
          alert(`Error: ${err.error || 'No se pudo modificar la venta'}`);
        } catch {
          alert(`Error del servidor (${response.status}). Verificá que el backend esté corriendo.`);
        }
        return false;
      }
      return true;
    } catch (error) {
      alert('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
      return false;
    }
  };

  const eliminarVenta = async (id) => {
    if (!window.confirm('¿Estás seguro que querés eliminar esta venta?')) return;
    try {
      const response = await fetch(`${API_URL}/ventas/${id}/cancelar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setVentasDelDia(prev => prev.filter(v => v.id !== id));
      } else {
        alert('No se pudo eliminar la venta.');
      }
    } catch {
      alert('Error de conexión.');
    }
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
    if (ventaEditando.items.length === 0) {
      alert('Debe haber al menos un producto en la venta');
      return;
    }
    if (ventaEditando.pagos.length === 0) {
      alert('Debe haber al menos un medio de pago');
      return;
    }
    if (Math.abs(totalItems - totalPagos) > 0.01) {
      alert(`El total de pagos ($${totalPagos.toLocaleString()}) no coincide con el total de productos ($${totalItems.toLocaleString()})`);
      return;
    }
    const ok = await apiModificarVenta(ventaEditando.id, ventaEditando.items, totalItems, ventaEditando.pagos);
    if (ok) {
      setVentasDelDia(prev => prev.map(v =>
        v.id === ventaEditando.id
          ? { ...v, items: ventaEditando.items, pagos: ventaEditando.pagos, total: totalItems }
          : v
      ));
      setVentaEditando(null);
    }
  };

  // Cargar ventas del mes visible en el calendario
  const apiCargarVentasDelDia = async (mesVer = calMes, añoVer = calAño) => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!user || !tokenActual) return;
    try {
      const ultimoDia = new Date(añoVer, mesVer + 1, 0).getDate();
      const fechaInicio = `${añoVer}-${String(mesVer + 1).padStart(2, '0')}-01`;
      const fechaFin = `${añoVer}-${String(mesVer + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

      const response = await fetch(`${API_URL}/ventas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${tokenActual}` }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 403) {
          alert('Tu sesión expiró. Por favor volvé a iniciar sesión.');
          logout();
          return;
        }
        console.error('Error al cargar ventas:', err);
        return;
      }

      const data = await response.json();
      if (data && Array.isArray(data.ventas)) {
        const ventasFormateadas = data.ventas.map(v => {
          let items = v.items;
          let pagos = v.pagos;
          try {
            items = typeof items === 'string' && items.trim() ? JSON.parse(items) : (items || []);
          } catch (e) {
            items = [];
          }
          try {
            pagos = typeof pagos === 'string' && pagos.trim() ? JSON.parse(pagos) : (pagos || []);
          } catch (e) {
            pagos = [];
          }
          return { ...v, items, pagos };
        });
        setVentasDelDia(ventasFormateadas);
      }
    } catch (error) {
      console.error('Error al obtener ventas:', error);
    }
  };

  // Actualizar ventas cuando se muestre el dashboard
  // Cargar ventas, retiros y productos al iniciar sesión
  useEffect(() => {
    if (user && token) {
      const hoy = new Date();
      apiCargarVentasDelDia(hoy.getMonth(), hoy.getFullYear());
      cargarRetiros();
      cargarProductos();
    }
  }, [user, token]);

  // Cargar ventas del mes visible al entrar al dashboard o cambiar de mes
  useEffect(() => {
    if (user && token && mostrarDashboard) {
      apiCargarVentasDelDia(calMes, calAño);
      const intervalo = setInterval(() => apiCargarVentasDelDia(calMes, calAño), 30000);
      return () => clearInterval(intervalo);
    }
  }, [user, token, mostrarDashboard, calMes, calAño]);

  const cargarRetiros = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const hoy = new Date();
      const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
      const res = await fetch(`${API_URL}/retiros?fecha_inicio=${fecha}&fecha_fin=${fecha}`, {
        headers: { 'Authorization': `Bearer ${tokenActual}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRetiros(data.retiros || []);
      }
    } catch (e) {
      console.error('Error al cargar retiros:', e);
    }
  };

  const agregarRetiro = async () => {
    const monto = parseFloat(nuevoRetiroMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido para el retiro'); return; }
    const hoyStr = (() => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`; })();
    const montoDisponible = (inicioCaja ? inicioCaja.montoInicial : 0) + ventasDelDia.filter(v => fechaLocal(v.fecha) === hoyStr).reduce((s, v) => {
      const efectivo = (v.pagos || []).reduce((ps, p) => p.metodo === 'EFECTIVO' ? ps + (parseFloat(p.monto) || 0) : ps, 0);
      return s + efectivo;
    }, 0) - sumarRetiros();
    if (monto > montoDisponible) {
      alert(`El monto excede el efectivo disponible ($${montoDisponible.toLocaleString()}). No se puede registrar el retiro.`);
      return;
    }
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/retiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
        body: JSON.stringify({ usuario_id: user.id, monto, descripcion: nuevoRetiroDesc || 'Retiro' })
      });
      if (res.ok) {
        await cargarRetiros();
        setNuevoRetiroMonto('');
        setNuevoRetiroDesc('');
      } else {
        alert('Error al guardar el retiro');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  const iniciarEdicionRetiro = (idx) => {
    if (!isAdmin) { alert('No tiene permisos para editar retiros'); return; }
    setRetiroEditandoIdx(idx);
    setEditandoMonto(String(retiros[idx].monto));
    setEditandoDesc(retiros[idx].descripcion || '');
  };

  const guardarEdicionRetiro = (idx) => {
    if (!isAdmin) { alert('No tiene permisos para editar retiros'); return; }
    const monto = parseFloat(editandoMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido'); return; }
    const copia = [...retiros];
    copia[idx] = { ...copia[idx], monto, descripcion: editandoDesc || 'Retiro' };
    setRetiros(copia);
    setRetiroEditandoIdx(null);
    setEditandoMonto('');
    setEditandoDesc('');
  };

  const cancelarEdicionRetiro = () => {
    setRetiroEditandoIdx(null);
    setEditandoMonto('');
    setEditandoDesc('');
  };

  const iniciarIngresoExtra = () => {
    setMostrarIngresoForm(true);
    setIngresoMonto('');
    setIngresoDesc('');
    setIngresoMetodo('EFECTIVO');
  };

  const cancelarIngresoExtra = () => {
    setMostrarIngresoForm(false);
    setIngresoMonto('');
    setIngresoDesc('');
    setIngresoMetodo('EFECTIVO');
  };

  const guardarIngresoExtra = () => {
    const monto = parseFloat(ingresoMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido para el ingreso'); return; }
    const nuevaVenta = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      items: [],
      total: monto,
      pagos: [{ metodo: ingresoMetodo, monto }],
      descripcion: ingresoDesc || 'Ingreso extra',
      usuario: user?.nombre || null
    };
    setVentasDelDia([...ventasDelDia, nuevaVenta]);
    setIngresoMonto('');
    setIngresoDesc('');
    setIngresoMetodo('EFECTIVO');
    alert(`Ingreso registrado: $${monto.toLocaleString()} (${ingresoMetodo})`);
  };

  const eliminarRetiro = async (idx) => {
    if (!isAdmin) { alert('No tiene permisos para eliminar retiros'); return; }
    if (!window.confirm('¿Eliminar este retiro?')) return;
    const retiro = retiros[idx];
    const tokenActual = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/retiros/${retiro.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenActual}` }
      });
      if (res.ok) {
        await cargarRetiros();
      } else {
        alert('Error al eliminar el retiro');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  const [todosProductos, setTodosProductos] = useState([]);

  const cargarTodosProductos = async () => {
    const tokenActual = localStorage.getItem('auth_token');
    if (!tokenActual) return;
    try {
      const res = await fetch(`${API_URL}/productos?todos=true`, {
        headers: { 'Authorization': `Bearer ${tokenActual}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTodosProductos(data);
      }
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
      if (res.ok) {
        await cargarProductos(); await cargarTodosProductos();
        setProductoEditando(null);
      } else { alert('Error al editar producto'); }
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

  // ========== FUNCIONES DE GASTOS ==========
  const agregarGasto = () => {
    const monto = parseFloat(nuevoGastoMonto);
    if (!monto || monto <= 0) { alert('Ingrese un monto válido para el gasto'); return; }
    const nuevo = { monto, descripcion: nuevoGastoDesc || 'Gasto', fecha: new Date().toISOString(), usuario: user?.nombre || null };
    setGastos([...gastos, nuevo]);
    setNuevoGastoMonto('');
    setNuevoGastoDesc('');
    alert(`Gasto registrado: $${monto.toLocaleString()}`);
  };

  const eliminarGasto = (idx) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    const copia = [...gastos];
    copia.splice(idx, 1);
    setGastos(copia);
  };

  const cancelarGasto = () => {
    setMostrarFormGastos(false);
    setNuevoGastoMonto('');
    setNuevoGastoDesc('');
  };

  // El dashboard usará datos reales cargados desde la BD en `ventasDelDia`.
  // Se eliminan las ventas simuladas para evitar mostrar datos de ejemplo.

  useEffect(() => {
    try {
      const open = localStorage.getItem('cajaAbierta') === 'true';
      const inicio = localStorage.getItem('inicioCaja');
      const idCaja = localStorage.getItem('cajaId');
      setCajaAbierta(open);
      setInicioCaja(inicio ? JSON.parse(inicio) : null);
      if (idCaja) setCajaId(Number(idCaja));
      if (!open) setMostrarCaja(false);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (!cajaAbierta) {
        setMostrarCaja(true);
      }
    } else {
      setMostrarCaja(false);
      setMostrarDashboard(false);
    }
  }, [user, cajaAbierta]);

  const agregarAlCarrito = (producto) => {
    if (!cajaAbierta) {
      alert('Debe abrir la caja antes de realizar ventas.');
      setMostrarCaja(true);
      return;
    }
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const calcularTotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const limpiarCarrito = () => setCarrito([]);

  const eliminarSeleccionado = () => {
    if (seleccionado !== null) {
      const item = carrito.find(item => item.id === seleccionado);
      if (!item) return;
      if (item.cantidad > 1) {
        setCarrito(carrito.map(producto =>
          producto.id === seleccionado ? { ...producto, cantidad: producto.cantidad - 1 } : producto
        ));
      } else {
        setCarrito(carrito.filter(producto => producto.id !== seleccionado));
        setSeleccionado(null);
      }
    }
  };

  const cobrar = () => {
    if (!cajaAbierta) {
      alert('Debe abrir la caja antes de cobrar.');
      setMostrarCaja(true);
      return;
    }
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setMostrarModalPago(true);
  };

  const agregarMetodoPago = (metodo) => {
    const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    if (pagosSeleccionados.length === 0) {
      setPagosSeleccionados([{ metodo, monto: totalVenta }]);
    } else {
      const montoRestante = totalVenta - pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0);
      setPagosSeleccionados([...pagosSeleccionados, { metodo, monto: montoRestante }]);
    }
  };

  const quitarMetodoPago = (index) => {
    setPagosSeleccionados(pagosSeleccionados.filter((_, i) => i !== index));
  };

  const actualizarMontoPago = (index, nuevoMonto) => {
    const actualizado = [...pagosSeleccionados];
    actualizado[index].monto = parseFloat(nuevoMonto) || 0;
    setPagosSeleccionados(actualizado);
  };

    const confirmarVenta = async () => {
  const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalPagos = pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0);
  if (Math.abs(totalPagos - totalVenta) > 0.01) {
    alert(`Error: El total de pagos ($${totalPagos.toLocaleString()}) no coincide con el total de la venta ($${totalVenta.toLocaleString()})`);
    return;
  }

  const ventaBase = {
    fecha: new Date().toISOString(),
    items: carrito.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
    total: totalVenta,
    pagos: pagosSeleccionados.map(p => ({ metodo: p.metodo, monto: p.monto }))
  };

  // Guardar en la BD primero
  console.log('Guardando venta en BD...');
  const ventaId = await apiGuardarVenta(ventaBase);

  if (!ventaId) {
    alert('Error: No se pudo guardar la venta en la base de datos. Intente de nuevo.');
    return;
  }

  const nuevaVenta = { ...ventaBase, id: ventaId };

  // Solo si se guardó exitosamente, actualizar el estado local
  const ventasActualizadas = [...ventasDelDia, nuevaVenta];
  setVentasDelDia(ventasActualizadas);

  console.log('✅ Venta guardada localmente y en BD:', nuevaVenta);

  // Guardar la venta confirmada y mostrar el resumen
  setVentaConfirmada(nuevaVenta);
  setMostrarModalPago(false);
};

  const cancelarVenta = () => {
    setMostrarModalPago(false);
    setPagosSeleccionados([]);
  };

  const cerrarResumenVenta = () => {
    setVentaConfirmada(null);
    setPagosSeleccionados([]);
    limpiarCarrito();
    setSeleccionado(null);
    setCategoriaActiva(null);
  };

  const buildVentaDesdeCarrito = () => {
    const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    return {
      id: Date.now(),
      fecha: new Date().toISOString(),
      items: carrito.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
      total: totalVenta,
      pagos: pagosSeleccionados.map(p => ({ metodo: p.metodo, monto: p.monto }))
    };
  };

  const generarHTMLTicket = (venta) => {
    const nombreTienda = 'Grido Laspiur';
    const fecha = new Date(venta.fecha).toLocaleString('es-AR');
    const itemsHtml = (venta.items || []).map(it => `
      <tr>
        <td style="padding:4px 8px">${it.cantidad} x ${it.nombre}</td>
        <td style="padding:4px 8px; text-align:right">$${(it.precio * it.cantidad).toLocaleString()}</td>
      </tr>
    `).join('');
    const pagosHtml = (venta.pagos || []).map(p => `<div style="display:flex;justify-content:space-between;margin-top:6px"><div>${p.metodo}</div><div>$${p.monto.toLocaleString()}</div></div>`).join('');
    const totalHtml = `<div style="display:flex;justify-content:space-between;font-weight:700;margin-top:8px"><div>TOTAL</div><div>$${venta.total.toLocaleString()}</div></div>`;
    const descripcion = venta.descripcion ? `<div style="margin-top:6px">${venta.descripcion}</div>` : '';

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Ticket</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 10px; }
            .center { text-align: center; }
            .items { width: 100%; border-collapse: collapse; margin-top: 8px; }
            @media print { body { margin:0 } }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin:6px 0">${nombreTienda}</h2>
            <div>${fecha}</div>
          </div>
          <hr />
          <table class="items">
            ${itemsHtml}
          </table>
          ${totalHtml}
          <div style="margin-top:8px">${pagosHtml}</div>
          ${descripcion}
          <hr />
          <div class="center">Gracias por su compra</div>
        </body>
      </html>
    `;
  };

  const printTicket = (venta) => {
    const html = generarHTMLTicket(venta);
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) { alert('No se pudo abrir la ventana de impresión. Revisa el bloqueador de ventanas emergentes.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.print(); /* w.close(); */ }, 300);
  };

  const filtrarVentasPorPeriodo = () => {
    const hoy = new Date();
    if (!ventasDelDia || ventasDelDia.length === 0) return [];
    if (periodoSeleccionado === 'HOY') {
      const yyyy = hoy.getFullYear(); const mm = String(hoy.getMonth() + 1).padStart(2, '0'); const dd = String(hoy.getDate()).padStart(2, '0');
      const fechaStr = `${yyyy}-${mm}-${dd}`;
      return ventasDelDia.filter(v => fechaLocal(v.fecha) === fechaStr);
    } else if (periodoSeleccionado === 'SEMANA') {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - 7);
      return ventasDelDia.filter(v => {
        const fv = new Date(v.fecha);
        return fv >= inicioSemana && fv <= hoy;
      });
    } else if (periodoSeleccionado === 'MES') {
      const mes = hoy.getMonth(); const anio = hoy.getFullYear();
      return ventasDelDia.filter(v => {
        const fv = new Date(v.fecha);
        return fv.getMonth() === mes && fv.getFullYear() === anio;
      });
    }
    return ventasDelDia;
  };
  const calcularMetricasMedios = (ventas = ventasDelDia) => {
  const resumen = {};
  ventas.forEach(v => {
    (v.pagos || []).forEach(p => {
      const metodo = p.metodo || 'OTRO';
      resumen[metodo] = (resumen[metodo] || 0) + (parseFloat(p.monto) || 0);
    });
  });
  const total = Object.values(resumen).reduce((s, a) => s + a, 0);
  const lista = Object.keys(resumen).map(m => ({
    metodo: m,
    monto: resumen[m],
    porcentaje: total ? Math.round((resumen[m] * 100) / total) : 0
  }));
  // ordenar desc por monto
  lista.sort((a, b) => b.monto - a.monto);
  return { resumen, lista, total };
};
  const calcularMetricas = () => {
    const ventas = filtrarVentasPorPeriodo();
    const totalVentas = ventas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0);
    const cantidadVentas = ventas.length;
    const cantidadProductos = ventas.reduce((sum, v) => {
      const items = v.items || [];
      return sum + items.reduce((s, it) => s + (parseInt(it.cantidad) || 0), 0);
    }, 0);
    const ventaPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;
    return { totalVentas, cantidadVentas, cantidadProductos, ventaPromedio };
  };

  const buildResumenNumerico = () => {
    const m = calcularMetricas();
    const medios = calcularMetricasMedios();
    const ventas = m.totalVentas;
    const retirosHoy = sumarRetiros();
    const diferencia = ventas - retirosHoy;
    const topMedio = medios.lista && medios.lista.length > 0 ? `${medios.lista[0].metodo} (${medios.lista[0].porcentaje}%)` : '—';
    return { ventas, retirosHoy, diferencia, topMedio };
  };

  const resumenNumerico = buildResumenNumerico();

  const obtenerTop5Productos = () => {
    const ventas = filtrarVentasPorPeriodo();
    const agrupado = {};
    ventas.forEach(v => {
      const items = v.items || [];
      items.forEach(it => {
        const key = it.id || it.nombre || JSON.stringify(it);
        if (!agrupado[key]) agrupado[key] = { nombre: it.nombre || key, cantidad: 0, total: 0 };
        agrupado[key].cantidad += parseInt(it.cantidad) || 0;
        agrupado[key].total += (parseFloat(it.precio) || 0) * (parseInt(it.cantidad) || 0);
      });
    });
    return Object.values(agrupado).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  };

  // ========== FUNCIONES DE REPORTES POR PERÍODO ==========
  const generarReporteDiario = () => {
    const reportePorDia = {};
    (ventasDelDia || []).forEach(v => {
      const fecha = fechaLocal(v.fecha);
      if (!reportePorDia[fecha]) {
        reportePorDia[fecha] = { fecha, total: 0, cantidad: 0, productos: {} };
      }
      reportePorDia[fecha].total += parseFloat(v.total) || 0;
      const items = v.items || [];
      items.forEach(it => {
        const key = it.nombre || `Producto ${it.id}`;
        if (!reportePorDia[fecha].productos[key]) {
          reportePorDia[fecha].productos[key] = { nombre: key, cantidad: 0, total: 0 };
        }
        reportePorDia[fecha].productos[key].cantidad += parseInt(it.cantidad) || 0;
        reportePorDia[fecha].productos[key].total += (parseFloat(it.precio) || 0) * (parseInt(it.cantidad) || 0);
      });
      reportePorDia[fecha].cantidad += items.length;
    });
    return Object.values(reportePorDia).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const generarReporteSemanal = () => {
    const reportePorSemana = {};
    const hoy = new Date();
    (ventasDelDia || []).forEach(v => {
      const fv = new Date(v.fecha);
      const diff = (hoy - fv) / (1000 * 60 * 60 * 24);
      const semana = Math.floor(diff / 7);
      const clave = `Semana ${semana}`;
      if (!reportePorSemana[clave]) {
        reportePorSemana[clave] = { semana: clave, total: 0, cantidadProductos: 0, productos: {} };
      }
      reportePorSemana[clave].total += parseFloat(v.total) || 0;
      const items = v.items || [];
      items.forEach(it => {
        const key = it.nombre || `Producto ${it.id}`;
        if (!reportePorSemana[clave].productos[key]) {
          reportePorSemana[clave].productos[key] = { nombre: key, cantidad: 0, total: 0 };
        }
        reportePorSemana[clave].productos[key].cantidad += parseInt(it.cantidad) || 0;
        reportePorSemana[clave].productos[key].total += (parseFloat(it.precio) || 0) * (parseInt(it.cantidad) || 0);
      });
      reportePorSemana[clave].cantidadProductos += items.reduce((s, it) => s + (parseInt(it.cantidad) || 0), 0);
    });
    return Object.values(reportePorSemana);
  };

  const generarReporteMensual = () => {
    const reportePorMes = {};
    (ventasDelDia || []).forEach(v => {
      const fv = new Date(v.fecha);
      const mes = fv.getMonth() + 1;
      const anio = fv.getFullYear();
      const clave = `${anio}-${String(mes).padStart(2, '0')}`;
      if (!reportePorMes[clave]) {
        reportePorMes[clave] = { mes: clave, total: 0, cantidadProductos: 0, productos: {} };
      }
      reportePorMes[clave].total += parseFloat(v.total) || 0;
      const items = v.items || [];
      items.forEach(it => {
        const key = it.nombre || `Producto ${it.id}`;
        if (!reportePorMes[clave].productos[key]) {
          reportePorMes[clave].productos[key] = { nombre: key, cantidad: 0, total: 0 };
        }
        reportePorMes[clave].productos[key].cantidad += parseInt(it.cantidad) || 0;
        reportePorMes[clave].productos[key].total += (parseFloat(it.precio) || 0) * (parseInt(it.cantidad) || 0);
      });
      reportePorMes[clave].cantidadProductos += items.reduce((s, it) => s + (parseInt(it.cantidad) || 0), 0);
    });
    return Object.values(reportePorMes).sort((a, b) => b.mes.localeCompare(a.mes));
  };

  // Función para limpiar/resetear datos del dashboard
  const limpiarDatos = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos del dashboard? Esta acción no se puede deshacer.')) {
      setVentasDelDia([]);
      setDiaSeleccionado(null);
      alert('Datos limpios. El dashboard ha sido reiniciado.');
    }
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

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
    } catch (e) {
      alert('Error de conexión al abrir caja'); return;
    }
    setInicioCaja(datosCaja);
    setCajaAbierta(true);
    setMostrarCaja(false);
    localStorage.setItem('cajaAbierta', 'true');
    localStorage.setItem('inicioCaja', JSON.stringify(datosCaja));
    alert(`Caja abierta exitosamente\nMonto inicial: $${total.toLocaleString()}`);
  };

  const calcularResumenCaja = () => {
    const montoInicial = inicioCaja ? inicioCaja.montoInicial : 0;
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const ventasHoy = ventasDelDia.filter(v => fechaLocal(v.fecha) === fechaHoy);
    // Sumar SOLO el efectivo de hoy, no transferencias ni débitos
    const totalVentas = ventasHoy.reduce((sum, v) => {
      const efectivoDelVenta = v.pagos?.reduce((pSum, p) => {
        return p.metodo === 'EFECTIVO' ? pSum + (parseFloat(p.monto) || 0) : pSum;
      }, 0) || 0;
      return sum + efectivoDelVenta;
    }, 0);
    const retirosSum = sumarRetiros();
    const gastosSum = sumarGastos();
    const totalEsperado = montoInicial + totalVentas - retirosSum - gastosSum;
    const totalReal = calcularTotalCierre();
    const diferencia = totalReal - totalEsperado;

    return { montoInicial, totalVentas, retiros: retirosSum, gastos: gastosSum, totalEsperado, totalReal, diferencia };
  };

  const confirmarCierreCaja = async () => {
    const resumen = calcularResumenCaja();
    const tokenActual = localStorage.getItem('auth_token');
    const idCaja = cajaId || localStorage.getItem('cajaId');
    if (idCaja) {
      try {
        const denomCierre = denomCierreRef.current?.getValues() || {};
        await fetch(`${API_URL}/cajas/${idCaja}/cerrar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenActual}` },
          body: JSON.stringify({
            monto_cierre: resumen.totalReal,
            denominaciones_cierre: denomCierre,
            diferencia: resumen.diferencia,
            total_ventas: resumen.totalVentas,
            total_retiros: resumen.retiros,
            total_gastos: resumen.gastos
          })
        });
      } catch (e) {
        console.error('Error al cerrar caja en BD:', e);
      }
    }
    alert(`Cierre de caja\n\nEsperado: $${resumen.totalEsperado.toLocaleString()}\nReal: $${resumen.totalReal.toLocaleString()}\nRetiros: $${resumen.retiros.toLocaleString()}\nGastos: $${resumen.gastos.toLocaleString()}\nDiferencia: $${resumen.diferencia.toLocaleString()}`);
    setCajaAbierta(false);
    setMostrarCaja(false);
    setCajaId(null);
    setCierreKey(k => k + 1);
    setCierreTotalContado(0);
    setVentasDelDia([]);
    setInicioCaja(null);
    setRetiros([]);
    setGastos([]);
    localStorage.removeItem('cajaAbierta');
    localStorage.removeItem('inicioCaja');
    localStorage.removeItem('cajaId');
    localStorage.removeItem('retiros');
    localStorage.removeItem('gastos');
    localStorage.removeItem('cierre-denominaciones');
  };

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', maxWidth: '1400px', margin: '0 auto 30px', gap: '12px' }}>
        <h1 style={{ margin: 0, marginRight: '8px', fontSize: '14px', fontWeight: 600 }}>🍦 Grido Laspiur</h1>
          <div className="header-actions" style={{ display: 'flex', gap: 0, alignItems: 'center', marginLeft: 'auto' }}>
            <nav className="main-nav" style={{ display: 'flex', gap: '6px' }}>
              <button className={`nav-btn ${mostrarDashboard ? 'active' : ''}`} onClick={() => { setMostrarDashboard(true); setMostrarCaja(false); setMostrarRetiros(false); }}>Dashboard</button>
              <button className={`nav-btn ${mostrarCaja ? 'active' : ''}`} onClick={() => { setMostrarCaja(true); setMostrarDashboard(false); setMostrarRetiros(false); }}>Caja</button>
              <button className={`nav-btn ${mostrarRetiros ? 'active' : ''}`} onClick={() => { setMostrarRetiros(true); setMostrarCaja(false); setMostrarDashboard(false); }}>Retiros</button>
              <button className={`nav-btn`} onClick={() => { setMostrarDashboard(false); setMostrarCaja(false); setMostrarRetiros(false); setMostrarGestionProductos(false); setCategoriaActiva(null); }}>Productos</button>
              {isAdmin && <button className={`nav-btn ${mostrarGestionProductos ? 'active' : ''}`} onClick={() => { setMostrarGestionProductos(true); setMostrarDashboard(false); setMostrarCaja(false); setMostrarRetiros(false); cargarTodosProductos(); }}>Gestión</button>}
            </nav>
            <div className="header-right" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button className={`btn-open-caja ${cajaAbierta ? 'open' : ''}`} onClick={() => { setMostrarDashboard(false); setMostrarCaja(true); }}>{cajaAbierta ? '💰 Caja Abierta' : '💰 Abrir Caja'}</button>

              {user && (
                <>
                  <div className="usuario-info">{user.nombre}</div>
                  <button className="btn-logout" onClick={() => {
                    if (cajaAbierta) {
                      alert('⚠️ Debes cerrar la caja antes de cerrar sesión.');
                      setMostrarDashboard(false);
                      setMostrarCaja(true);
                      setMostrarRetiros(false);
                      setCategoriaActiva(null);
                      return;
                    }
                    setCajaAbierta(false);
                    setInicioCaja(null);
                    localStorage.removeItem('cajaAbierta');
                    localStorage.removeItem('inicioCaja');
                    localStorage.removeItem('retiros');
                    localStorage.removeItem('gastos');
                    logout();
                  }}>Cerrar sesión</button>
                </>
              )}
            </div>
          </div>
      </div>


{mostrarCaja ? (
        <div className="caja-container">
          {!cajaAbierta ? (
            <div className="inicio-caja">
              <h2>💰 Inicio de Caja</h2>
              <p className="fecha-caja">📅 {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <DenomGrid ref={denomInicioRef} prefix="inicio" gridClass="denominaciones-grid" totalLabel="Total Inicio de Caja" />
              <div className="botones-caja">
                <button className="btn-inicio-caja" onClick={confirmarInicioCaja}>✓ Confirmar e Iniciar Caja</button>
                <button className="btn-cancelar-caja" onClick={() => setMostrarCaja(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="cierre-caja">
              <h2>💰 Cierre de Caja</h2>
              <p className="fecha-caja">📅 {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div className="cierre-layout">
                <div className="cierre-conteo">
                  <h3>💵 Contar Efectivo en Caja</h3>
                  <DenomGrid ref={denomCierreRef} key={cierreKey} prefix="cierre" gridClass="denominaciones-grid-cierre" totalLabel="Total Contado" onTotalChange={setCierreTotalContado} storageKey="cierre-denominaciones" />
                </div>
                <div className="cierre-resumen">
                  <h3>📊 Resumen del Día</h3>
                  <div className="resumen-item"><span>Inicio de Caja:</span><span className="monto">${calcularResumenCaja().montoInicial.toLocaleString()}</span></div>
                  <div className="resumen-item"><span>Ventas del Día:</span><span className="monto positivo">${calcularResumenCaja().totalVentas.toLocaleString()}</span></div>
                  {(() => {
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const ventasHoy = ventasDelDia.filter(v => fechaLocal(v.fecha) === fechaHoy);
  const medios = calcularMetricasMedios(ventasHoy);
  return medios.lista.length > 0 ? (
    <div className="resumen-medios">
      <h4>Medios de Pago</h4>
      {medios.lista.map((m, idx) => (
        <div key={idx} className="resumen-item">
          <span>{m.metodo}</span>
          <span className="monto">${m.monto.toLocaleString()}<span className="porcentaje"> {m.porcentaje}%</span></span>
        </div>
      ))}
    </div>
  ) : null;
})()}
                  <div className="retirar-form">
                    {isAdmin ? (
                      <>
                        <input name="retiro-monto" type="number" min="1" value={nuevoRetiroMonto} onChange={(e) => setNuevoRetiroMonto(e.target.value)} placeholder="Monto retiro" />
                        <input name="retiro-desc" type="text" value={nuevoRetiroDesc} onChange={(e) => setNuevoRetiroDesc(e.target.value)} placeholder="Concepto (opcional)" />
                        <button className="btn-retiro" onClick={agregarRetiro}>Registrar Retiro</button>
                        <button className="export-btn" onClick={exportarRetirosCSV} disabled={retiros.length===0}>Exportar retiros</button>
                      </>
                    ) : (
                      <div className="sin-permiso">No tenés permisos para registrar retiros</div>
                    )}
                  </div>
                  <div className="retirar-form" style={{ marginTop: 10 }}>
                    <input name="ingreso-monto" type="number" min="0" value={ingresoMonto} onChange={(e) => setIngresoMonto(e.target.value)} placeholder="Monto ingreso" />
                    <input name="ingreso-desc" type="text" value={ingresoDesc} onChange={(e) => setIngresoDesc(e.target.value)} placeholder="Descripción (opcional)" />
                    <select name="ingreso-metodo" className="select-metodo" value={ingresoMetodo} onChange={(e) => setIngresoMetodo(e.target.value)}>
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                      <option value="DÉBITO">DÉBITO</option>
                    </select>
                    <button className="btn-retiro" onClick={guardarIngresoExtra}>➕ Registrar Ingreso</button>
                  </div>
                  <div className="lista-retiros">
                    {retiros.length > 0 ? (
                      <>
                        {retiros.map((r, idx) => (
                          <div key={idx} className="resumen-item retiro-item">
                            <span>{r.descripcion} <small className="retiro-fecha">({new Date(r.fecha).toLocaleTimeString()})</small></span>
                            <span className="monto negativo">${r.monto.toLocaleString()} {isAdmin && <button className="btn-eliminar-retiro" onClick={() => eliminarRetiro(idx)}>✕</button>}</span>
                          </div>
                        ))}
                        {retiroEditandoIdx !== null && (
                          <div className="resumen-item retiro-edicion">
                            <input name="edit-desc" type="text" value={editandoDesc} onChange={(e) => setEditandoDesc(e.target.value)} placeholder="Descripción" />
                            <input name="edit-monto" type="number" value={editandoMonto} onChange={(e) => setEditandoMonto(e.target.value)} placeholder="Monto" />
                            <button className="btn-guardar" onClick={() => guardarEdicionRetiro(retiroEditandoIdx)}>✓ Guardar</button>
                            <button className="btn-cancelar" onClick={cancelarEdicionRetiro}>⏮ Cancelar</button>
                          </div>
                        )}
                        <div className="resumen-item"><span>Total Retiros:</span><span className="monto negativo">${calcularResumenCaja().retiros.toLocaleString()}</span></div>
                      </>
                    ) : (
                      <div className="resumen-item"><span>Retiros:</span><span className="monto negativo">$0</span></div>
                    )}
                  </div>
                  
                  <div className="lista-gastos">
                    <h4 style={{ margin: '0 0 8px 0' }}>💸 Gastos del Día</h4>
                    <div className="retirar-form" style={{ marginBottom: '8px' }}>
                      <input name="gasto-monto" type="number" min="0" value={nuevoGastoMonto} onChange={(e) => setNuevoGastoMonto(e.target.value)} placeholder="Monto gasto" />
                      <input name="gasto-desc" type="text" value={nuevoGastoDesc} onChange={(e) => setNuevoGastoDesc(e.target.value)} placeholder="Descripción (opcional)" />
                      <button className="btn-retiro" onClick={agregarGasto}>➕ Agregar Gasto</button>
                    </div>
                    {gastos.length > 0 ? (
                      <>
                        {gastos.map((g, idx) => (
                          <div key={idx} className="resumen-item retiro-item">
                            <span>{g.descripcion} <small className="retiro-fecha">({new Date(g.fecha).toLocaleTimeString()})</small></span>
                            <span className="monto negativo">${g.monto.toLocaleString()} <button className="btn-eliminar-retiro" onClick={() => eliminarGasto(idx)}>✕</button></span>
                          </div>
                        ))}
                        <div className="resumen-item"><span>Total Gastos:</span><span className="monto negativo">${calcularResumenCaja().gastos.toLocaleString()}</span></div>
                      </>
                    ) : (
                      <div className="resumen-item"><span>Gastos:</span><span className="monto negativo">$0</span></div>
                    )}
                  </div>
                  <div className="resumen-divider"></div>
                  <div className="resumen-item destacado"><span>Total Esperado:</span><span className="monto">${calcularResumenCaja().totalEsperado.toLocaleString()}</span></div>
                  <div className="resumen-item destacado"><span>Plata en Caja:</span><span className="monto">${calcularResumenCaja().totalReal.toLocaleString()}</span></div>
                  <div className="resumen-divider"></div>
                  <div className={`resumen-item final ${calcularResumenCaja().diferencia === 0 ? 'correcto' : calcularResumenCaja().diferencia > 0 ? 'sobrante' : 'faltante'}`}><span>Diferencia:</span><span className="monto">${calcularResumenCaja().diferencia.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="botones-caja">
                <button className="btn-confirmar-caja" onClick={confirmarCierreCaja}>✓ Confirmar Cierre de Caja</button>
                <button className="btn-cancelar-caja" onClick={() => setMostrarCaja(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      ) : mostrarRetiros ? (
        <div className="retiros-container">
          <h2>📋 Registro de Retiros</h2>
          <div className="retiros-content">
            <div className="retiros-formulario">
              <h3>Registrar Nuevo Retiro</h3>
              {isAdmin ? (
                <div className="retirar-form">
                  <input name="retiro-monto" type="number" min="1" value={nuevoRetiroMonto} onChange={(e) => setNuevoRetiroMonto(e.target.value)} placeholder="Monto del retiro" />
                  <input name="retiro-desc" type="text" value={nuevoRetiroDesc} onChange={(e) => setNuevoRetiroDesc(e.target.value)} placeholder="Concepto o descripción (opcional)" />
                  <button className="btn-retiro" onClick={agregarRetiro}>✓ Registrar Retiro</button>
                  <button className="export-btn" onClick={exportarRetirosCSV} disabled={retiros.length===0}>📥 Exportar a CSV</button>
                </div>
              ) : (
                <div className="sin-permiso">⚠️ No tenés permisos para registrar retiros</div>
              )}
            </div>
            <div className="retiros-lista">
              <h3>Historial de Retiros</h3>
              {retiros.length > 0 ? (
                <div className="lista-retiros-completa">
                  {retiros.map((r, idx) => (
                    <div key={idx} className={`retiro-item-full ${retiroEditandoIdx === idx ? 'editando' : ''}`}>
                      {retiroEditandoIdx === idx ? (
                        <div className="retiro-edicion-form">
                          <input name="edit-desc" type="text" value={editandoDesc} onChange={(e) => setEditandoDesc(e.target.value)} placeholder="Descripción" />
                          <input name="edit-monto" type="number" value={editandoMonto} onChange={(e) => setEditandoMonto(e.target.value)} placeholder="Monto" />
                          <button className="btn-guardar" onClick={() => guardarEdicionRetiro(idx)}>✓ Guardar</button>
                          <button className="btn-cancelar" onClick={cancelarEdicionRetiro}>⏮ Cancelar</button>
                        </div>
                      ) : (
                        <>
                          <div className="retiro-info">
                            <span className="retiro-desc">{r.descripcion}</span>
                            <span className="retiro-fecha">{new Date(r.fecha).toLocaleString('es-AR')}</span>
                            {r.usuario && <span className="retiro-usuario">Por: {r.usuario}</span>}
                          </div>
                          <div className="retiro-monto-container">
                            <span className="retiro-monto">${r.monto.toLocaleString()}</span>
                            {isAdmin && <>
                              <button className="btn-editar-retiro" onClick={() => iniciarEdicionRetiro(idx)}>✏️</button>
                              <button className="btn-eliminar-retiro" onClick={() => eliminarRetiro(idx)}>✕</button>
                            </>}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="retiro-total">
                    <span>Total Retiros:</span>
                    <span className="total-monto">${sumarRetiros().toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="retiros-vacio">No hay retiros registrados</div>
              )}
            </div>
          </div>
        </div>
      ) : mostrarGestionProductos && isAdmin ? (
        <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '16px' }}>⚙️ Gestión de Productos</h2>

          {/* Formulario nuevo producto */}
          <div style={{ background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Agregar nuevo producto</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input value={nuevoProducto.nombre} onChange={e => setNuevoProducto(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre" style={{ flex: 2, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', minWidth: '150px' }} />
              <input type="number" value={nuevoProducto.precio_unitario} onChange={e => setNuevoProducto(p => ({ ...p, precio_unitario: e.target.value }))} placeholder="Precio" style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', minWidth: '80px' }} />
              <select value={nuevoProducto.categoria} onChange={e => setNuevoProducto(p => ({ ...p, categoria: e.target.value }))} style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', minWidth: '100px' }}>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={guardarProducto} style={{ background: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>+ Agregar</button>
            </div>
          </div>

          {/* Lista de productos */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Categoría</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Precio</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Estado</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {todosProductos.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee', opacity: p.activo ? 1 : 0.5 }}>
                  {productoEditando?.id === p.id ? (
                    <>
                      <td style={{ padding: '6px' }}><input value={productoEditando.nombre} onChange={e => setProductoEditando(pe => ({ ...pe, nombre: e.target.value }))} style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} /></td>
                      <td style={{ padding: '6px' }}>
                        <select value={productoEditando.categoria} onChange={e => setProductoEditando(pe => ({ ...pe, categoria: e.target.value }))} style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '6px' }}><input type="number" value={productoEditando.precio_unitario} onChange={e => setProductoEditando(pe => ({ ...pe, precio_unitario: e.target.value }))} style={{ width: '80px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', textAlign: 'right' }} /></td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>—</td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <button onClick={guardarEdicionProducto} style={{ background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px', marginRight: '4px' }}>✓</button>
                        <button onClick={() => setProductoEditando(null)} style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '8px' }}>{p.nombre}</td>
                      <td style={{ padding: '8px', color: '#666' }}>{p.categoria}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>${parseFloat(p.precio_unitario).toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <span style={{ background: p.activo ? '#c6f6d5' : '#fed7d7', color: p.activo ? '#276749' : '#9b2c2c', borderRadius: '12px', padding: '2px 8px', fontSize: '11px' }}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => setProductoEditando({ id: p.id, nombre: p.nombre, precio_unitario: p.precio_unitario, categoria: p.categoria })} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px', marginRight: '4px' }}>Editar</button>
                        <button onClick={() => toggleActivoProducto(p)} style={{ background: p.activo ? '#e53e3e' : '#48bb78', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' }}>{p.activo ? 'Desactivar' : 'Activar'}</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : mostrarDashboard ? (
        <div className="dashboard-container">
          <h2 style={{ marginBottom: '16px' }}>📊 Dashboard de Ventas</h2>
          <div className="periodo-selector">
            <button className={periodoSeleccionado === 'HOY' ? 'periodo-btn active' : 'periodo-btn'} onClick={() => setPeriodoSeleccionado('HOY')}>HOY</button>
            <button className={periodoSeleccionado === 'SEMANA' ? 'periodo-btn active' : 'periodo-btn'} onClick={() => setPeriodoSeleccionado('SEMANA')}>ESTA SEMANA</button>
            <button className={periodoSeleccionado === 'MES' ? 'periodo-btn active' : 'periodo-btn'} onClick={() => setPeriodoSeleccionado('MES')}>ESTE MES</button>
          </div>
          <div className="dashboard-cards">
            <div className="dashboard-card verde"><div className="card-icono">💰</div><div className="card-numero">${calcularMetricas().totalVentas.toLocaleString()}</div><div className="card-titulo">Total Vendido</div></div>
            <div className="dashboard-card azul" style={{ cursor: 'pointer' }} onClick={() => setDetalleDashboard(detalleDashboard === 'ventas' ? null : 'ventas')}>
              <div className="card-icono">🛒</div><div className="card-numero">{calcularMetricas().cantidadVentas}</div>
              <div className="card-titulo">Ventas Realizadas</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{detalleDashboard === 'ventas' ? '▲ cerrar' : '▼ ver detalle'}</div>
            </div>
            <div className="dashboard-card naranja" style={{ cursor: 'pointer' }} onClick={() => setDetalleDashboard(detalleDashboard === 'productos' ? null : 'productos')}>
              <div className="card-icono">📦</div><div className="card-numero">{calcularMetricas().cantidadProductos}</div>
              <div className="card-titulo">Productos Vendidos</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{detalleDashboard === 'productos' ? '▲ cerrar' : '▼ ver detalle'}</div>
            </div>
            <div className="dashboard-card morado"><div className="card-icono">📈</div><div className="card-numero">${calcularMetricas().ventaPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</div><div className="card-titulo">Venta Promedio</div></div>
          </div>

          {detalleDashboard === 'ventas' && (() => {
            const ventas = filtrarVentasPorPeriodo();
            return (
              <div className="top-productos" style={{ marginTop: '16px' }}>
                <h3 style={{ color: '#000', marginBottom: '12px' }}>🛒 Detalle de Ventas — {periodoSeleccionado}</h3>
                {ventas.length === 0 ? (
                  <div style={{ color: '#999', padding: '16px', textAlign: 'center' }}>Sin ventas en este período</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Hora</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Productos</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Medio de pago</th>
                        <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Total</th>
                        {isAdmin && <th style={{ padding: '8px', textAlign: 'center', color: '#000' }}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map((v, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px', color: '#000', whiteSpace: 'nowrap' }}>
                            {new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '8px', color: '#000' }}>
                            {(v.items || []).length === 0
                              ? <span style={{ color: '#aaa' }}>—</span>
                              : (v.items || []).map((it, i) => (
                                <span key={i} style={{ display: 'block' }}>{it.cantidad}x {it.nombre}</span>
                              ))
                            }
                          </td>
                          <td style={{ padding: '8px', color: '#000' }}>
                            {(v.pagos || []).map((p, i) => (
                              <span key={i} style={{ display: 'block' }}>{p.metodo} ${parseFloat(p.monto).toLocaleString()}</span>
                            ))}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>${(v.total || 0).toLocaleString()}</td>
                          {isAdmin && (
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                <button onClick={() => abrirEdicionVenta(v)} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' }}>Editar</button>
                                <button onClick={() => eliminarVenta(v.id)} style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' }}>Eliminar</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}

          {detalleDashboard === 'productos' && (() => {
            const ventas = filtrarVentasPorPeriodo();
            const productosMap = {};
            ventas.forEach(v => {
              (v.items || []).forEach(it => {
                const key = it.nombre || it.id;
                if (!productosMap[key]) productosMap[key] = { nombre: it.nombre, cantidad: 0, total: 0 };
                productosMap[key].cantidad += parseInt(it.cantidad) || 0;
                productosMap[key].total += (parseFloat(it.precio) || 0) * (parseInt(it.cantidad) || 0);
              });
            });
            const lista = Object.values(productosMap).sort((a, b) => b.cantidad - a.cantidad);
            return (
              <div className="top-productos" style={{ marginTop: '16px' }}>
                <h3 style={{ color: '#000', marginBottom: '12px' }}>📦 Detalle de Productos Vendidos — {periodoSeleccionado}</h3>
                {lista.length === 0 ? (
                  <div style={{ color: '#999', padding: '16px', textAlign: 'center' }}>Sin productos en este período</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Producto</th>
                        <th style={{ padding: '8px', textAlign: 'center', color: '#000' }}>Cantidad</th>
                        <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px', color: '#000' }}>{p.nombre}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#000' }}>{p.cantidad} u.</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>${p.total.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid #ddd', backgroundColor: '#f8f8f8' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#000' }}>TOTAL</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>{lista.reduce((s, p) => s + p.cantidad, 0)} u.</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>${lista.reduce((s, p) => s + p.total, 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}>
            {/* CALENDARIO INTERACTIVO */}
            <div className="top-productos">
              <h3 style={{ color: '#000' }}>📅 Selecciona un Día</h3>
              <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #ddd' }}>
                {(() => {
                  const año = calAño;
                  const mes = calMes;
                  const primerDia = new Date(año, mes, 1);
                  const ultimoDia = new Date(año, mes + 1, 0);
                  const diaInicio = primerDia.getDay();
                  const diasDelMes = ultimoDia.getDate();
                  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                  const nombreMes = new Date(año, mes).toLocaleDateString('es-AR', { month: 'long' });
                  const años = [];
                  for (let y = new Date().getFullYear(); y >= 2024; y--) años.push(y);
                  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

                  const irMesAnterior = () => {
                    if (mes === 0) { setCalMes(11); setCalAño(año - 1); }
                    else setCalMes(mes - 1);
                  };
                  const irMesSiguiente = () => {
                    if (mes === 11) { setCalMes(0); setCalAño(año + 1); }
                    else setCalMes(mes + 1);
                  };

                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '4px' }}>
                        <button onClick={irMesAnterior} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '14px' }}>‹</button>
                        <div style={{ display: 'flex', gap: '4px', flex: 1, justifyContent: 'center' }}>
                          <select value={mes} onChange={e => setCalMes(Number(e.target.value))} style={{ fontSize: '11px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
                          </select>
                          <select value={año} onChange={e => setCalAño(Number(e.target.value))} style={{ fontSize: '11px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            {años.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <button onClick={irMesSiguiente} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '14px' }}>›</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px' }}>
                        {diasSemana.map(dia => (
                          <div key={dia} style={{ textAlign: 'center', fontWeight: 'bold', color: '#000', fontSize: '10px', padding: '2px' }}>
                            {dia}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {Array(diaInicio).fill(null).map((_, i) => (
                          <div key={`vacio-${i}`} style={{ padding: '4px', textAlign: 'center' }}></div>
                        ))}
                        {Array.from({ length: diasDelMes }, (_, i) => i + 1).map(dia => {
                          const fechaString = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                          const ventasEnEsteDia = ventasDelDia.filter(v => fechaLocal(v.fecha) === fechaString);
                          const tieneVentas = ventasEnEsteDia.length > 0;
                          const estaSeleccionado = diaSeleccionado === fechaString;

                          return (
                            <button
                              key={dia}
                              onClick={() => setDiaSeleccionado(fechaString)}
                              style={{
                                padding: '4px 2px',
                                border: estaSeleccionado ? '2px solid #ff00ff' : '1px solid #ccc',
                                backgroundColor: estaSeleccionado ? '#fff3e0' : tieneVentas ? '#e8f5e9' : '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: '#000',
                                fontSize: '11px',
                                fontWeight: tieneVentas ? 'bold' : 'normal',
                                transition: 'all 0.2s',
                                minWidth: 0
                              }}
                              onMouseEnter={(e) => !estaSeleccionado && (e.target.style.backgroundColor = '#f0f0f0')}
                              onMouseLeave={(e) => !estaSeleccionado && (e.target.style.backgroundColor = tieneVentas ? '#e8f5e9' : '#fff')}
                            >
                              {dia}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                        <div>🟩 = Tiene ventas</div>
                        <div>🟨 = Seleccionado</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* DETALLES DEL DÍA SELECCIONADO */}
            <div className="top-productos">
              <h3 style={{ color: '#000' }}>
                {diaSeleccionado ? `📆 ${new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : '📆 Selecciona un día'}
              </h3>
              <div style={{ marginTop: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                {diaSeleccionado ? (() => {
                  const ventasDelDiaSeleccionado = ventasDelDia.filter(v => fechaLocal(v.fecha) === diaSeleccionado);
                  if (ventasDelDiaSeleccionado.length === 0) {
                    return <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No hay ventas este día</div>;
                  }
                  
                  const totalDia = ventasDelDiaSeleccionado.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0);
                  const totalProductos = ventasDelDiaSeleccionado.reduce((sum, v) => sum + (v.items?.length || 0), 0);
                  
                  // Agrupar productos por nombre
                  const productosMap = {};
                  ventasDelDiaSeleccionado.forEach(venta => {
                    (venta.items || []).forEach(item => {
                      if (!productosMap[item.nombre]) {
                        productosMap[item.nombre] = { cantidad: 0, total: 0, precio: item.precio };
                      }
                      productosMap[item.nombre].cantidad += item.cantidad;
                      productosMap[item.nombre].total += item.cantidad * item.precio;
                    });
                  });
                  
                  return (
                    <>
                      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '6px', marginBottom: '10px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000' }}>
                          <span>💰 Total del día:</span>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>${totalDia.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000', marginBottom: '4px' }}>
                          <span>🛒 Transacciones:</span>
                          <span style={{ fontWeight: 'bold' }}>{ventasDelDiaSeleccionado.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                          <span>📦 Productos vendidos:</span>
                          <span style={{ fontWeight: 'bold' }}>{totalProductos} unidades</span>
                        </div>
                      </div>

                      <h4 style={{ color: '#000', marginTop: '10px', fontSize: '12px' }}>Productos vendidos:</h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '6px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '6px', textAlign: 'left', color: '#000' }}>Producto</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: '#000' }}>Cant.</th>
                            <th style={{ padding: '6px', textAlign: 'right', color: '#000' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(productosMap).map(([nombre, datos], idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '6px', color: '#000' }}>{nombre}</td>
                              <td style={{ padding: '6px', textAlign: 'center', color: '#000' }}>{datos.cantidad}x</td>
                              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>${datos.total.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  );
                })() : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    Selecciona un día en el calendario para ver detalles de ventas
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="top-productos" style={{ marginTop: '24px' }}>
            <h3 style={{ color: '#000' }}>📊 Reporte Semanal (Últimas 4 Semanas)</h3>
            <div style={{ marginTop: '12px' }}>
              {generarReporteSemanal().length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Semana</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Productos Vendidos</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Total Vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generarReporteSemanal().map((sem, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', color: '#000' }}>{sem.semana}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: '#000' }}>{sem.cantidadProductos} unidades</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>${sem.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Sin datos de semanas</div>
              )}
            </div>
          </div>

          <div className="top-productos" style={{ marginTop: '24px' }}>
            <h3 style={{ color: '#000' }}>📈 Reporte Mensual (Últimos 12 Meses)</h3>
            <div style={{ marginTop: '12px' }}>
              {generarReporteMensual().length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Mes</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Productos Vendidos</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Total Vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generarReporteMensual().map((mes, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', color: '#000' }}>{mes.mes}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: '#000' }}>{mes.cantidadProductos} unidades</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>${mes.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Sin datos de meses</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="productos">
            <h2>Productos</h2>
            {categoriaActiva === null ? (
              <div className="categorias-menu">
                {categorias.map(cat => (
  <button 
    key={cat} 
    className={`categoria-btn 
      ${cat === 'TORTAS' ? 'torta-hero' : ''} 
      ${cat === 'TENTACIONES' ? 'tentacion-hero' : ''} 
      ${cat === 'PALITOS' ? 'palitos-hero' : ''} 
      ${cat === 'PIZZAS' ? 'pizzas-hero' : ''} 
      ${cat === 'FAMILIARES' ? 'familiar-hero' : ''} 
      ${cat === 'CUCURUCHOS' ? 'cucuruchos-hero' : ''} 
      ${cat === 'POSTRES' ? 'bombones-hero' : ''} 
      ${cat === 'GRANEL' ? 'granel-hero' : ''} 
      ${cat === 'BEBIDAS' ? 'bebidas-hero' : ''} 
      ${cat === 'BATIDOS' ? 'batidos-hero' : ''}
      ${cat === 'SIN TACC' ? 'sintacc-hero' : ''}
      ${cat === 'CHOCOLATES' ? 'chocolates-hero' : ''}`}
    aria-label={cat} 
    onClick={() => setCategoriaActiva(cat)}
  >
    {!['TORTAS', 'TENTACIONES', 'PALITOS', 'PIZZAS', 'FAMILIARES', 'CUCURUCHOS', 'POSTRES', 'GRANEL', 'BEBIDAS', 'BATIDOS', 'SIN TACC', 'CHOCOLATES'].includes(cat) && cat}
  </button>
))} 
              </div>
            ) : (
              <>
                <button className="btn-volver" onClick={() => setCategoriaActiva(null)}>← VOLVER A CATEGORÍAS</button>
                <h3>{categoriaActiva}</h3>
                <div className="productos-grid">
                  {categoriaActiva === 'PALITOS' ? (() => {
                    const palitos = productos.filter(p => p.categoria === 'PALITOS');
                    const bases = Array.from(new Set(palitos.map(p => p.nombre.replace(/\s+x\d+$/, ''))));
                    return (
                      <div className="palitos-rows">
                        {bases.map(base => {
                          const opciones = palitos.filter(p => p.nombre.startsWith(base));
                          return (
                            <div key={base} className="palitos-row">
                              {opciones.map(producto => (
                                <button key={producto.id} className="producto-btn" onClick={() => agregarAlCarrito(producto)}>
                                  <div>{producto.nombre}</div>
                                  <div className="precio">${producto.precio}</div>
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : productos.filter(p => p.categoria === categoriaActiva).map(producto => (
                    <button key={producto.id} className="producto-btn" onClick={() => agregarAlCarrito(producto)}>
                      <div>{producto.nombre}</div>
                      <div className="precio">${producto.precio}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="carrito">
            <h2>Carrito</h2>
            {carrito.length === 0 ? <p className="carrito-vacio">El carrito está vacío</p> : (
              <>
                <div className="carrito-items">
                  {carrito.map(item => (
                    <div key={item.id} className={`carrito-item ${seleccionado === item.id ? 'seleccionado' : ''}`} onClick={() => setSeleccionado(item.id)}>
                      <span>{item.nombre}</span>
                      <span>{item.cantidad}</span>
                      <span className="item-total">${item.precio * item.cantidad}</span>
                    </div>
                  ))}
                </div>
                <div className="total"><h3>TOTAL: ${totalCarrito}</h3></div>
                <div className="botones">
                  <button className="btn-cobrar" onClick={cobrar}>COBRAR</button>
                  <button className="btn-borrar" onClick={eliminarSeleccionado} disabled={seleccionado === null}>BORRAR</button>
                  <button className="btn-limpiar" onClick={limpiarCarrito}>LIMPIAR TODO</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mostrarModalPago && (
        <div className="modal-overlay" onClick={cancelarVenta}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💳 Método de Pago</h2>
            <div className="modal-total">
              <span>Total a cobrar:</span>
              <span className="modal-total-precio">${carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toLocaleString()}</span>
            </div>

            {pagosSeleccionados.length > 0 && (
              <div className="pagos-seleccionados">
                {pagosSeleccionados.map((pago, index) => (
                  <div key={index} className="pago-item">
                    <span className="pago-metodo">{pago.metodo}</span>
                    <input name={`pago-monto-${index}`} type="number" className="pago-monto-input" value={pago.monto} onChange={(e) => actualizarMontoPago(index, e.target.value)} placeholder="Monto" />
                    <button className="pago-quitar" onClick={() => quitarMetodoPago(index)}>✕</button>
                  </div>
                ))}

                <div className="pago-total-parcial">
                  <span>Total ingresado:</span>
                  <span className={pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0) === carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) ? 'total-correcto' : 'total-incorrecto'}>
                    ${pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
                  </span>
                </div>

                {/* Resumen legible de los métodos (útil para ticket / impresión) */}
                <div className="metodos-resumen">
                  <div className="label">Medios usados:</div>
                  <div className="metodos-list">
                    {pagosSeleccionados.map((p, i) => (
                      <div key={i} className="metodo-line">{p.metodo} — ${p.monto.toLocaleString()}</div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {pagosSeleccionados.length < 2 && (
              <div className="modal-botones">
                <button className="metodo-pago-btn efectivo" onClick={() => agregarMetodoPago('EFECTIVO')}>💵 EFECTIVO</button>
                <button className="metodo-pago-btn debito" onClick={() => agregarMetodoPago('DÉBITO')}>💳 DÉBITO</button>
                <button className="metodo-pago-btn transferencia" onClick={() => agregarMetodoPago('TRANSFERENCIA')}>📱 TRANSFERENCIA</button>
              </div>
            )}

            <div className="modal-acciones">
              {pagosSeleccionados.length > 0 && (
                <button className="modal-confirmar" onClick={confirmarVenta}>✓ CONFIRMAR VENTA</button>
              )}
              <button className="modal-cancelar" onClick={cancelarVenta}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {ventaConfirmada && (
        <div className="modal-overlay" onClick={cerrarResumenVenta}>
          <div className="modal-content resumen-venta" onClick={(e) => e.stopPropagation()}>
            <h2>✅ ¡Venta Confirmada!</h2>
            <div className="resumen-venta-contenido">
              <div className="resumen-venta-item">
                <span>Total:</span>
                <span className="resumen-venta-total">${ventaConfirmada.total.toLocaleString()}</span>
              </div>
              {ventaConfirmada.pagos && ventaConfirmada.pagos.length > 0 && (
                <div className="resumen-venta-pagos">
                  <h4>Medios de Pago:</h4>
                  {ventaConfirmada.pagos.map((p, idx) => (
                    <div key={idx} className="resumen-venta-pago">
                      <span>{p.metodo}</span>
                      <span>${p.monto.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              {ventaConfirmada.items && ventaConfirmada.items.length > 0 && (
                <div className="resumen-venta-items">
                  <h4>Productos:</h4>
                  {ventaConfirmada.items.map((it, idx) => (
                    <div key={idx} className="resumen-venta-item-detalle">
                      <span>{it.cantidad}x {it.nombre}</span>
                      <span>${(it.cantidad * it.precio).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-acciones-resumen">
              <button className="modal-imprimir" onClick={() => printTicket(ventaConfirmada)}>🖨️ IMPRIMIR TICKET</button>
              <button className="modal-confirmar" onClick={cerrarResumenVenta}>✓ CONTINUAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición de venta — solo admin */}
      {ventaEditando && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div style={{ background:'white', borderRadius:'12px', padding:'24px', width:'100%', maxWidth:'560px', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ margin:'0 0 16px', color:'#2d3748' }}>Editar venta</h3>

            {/* Items */}
            <h4 style={{ margin:'0 0 8px', color:'#4a5568' }}>Productos</h4>
            {ventaEditando.items.map((it, idx) => (
              <div key={idx} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', background:'#f8f9fa', padding:'6px 10px', borderRadius:'6px' }}>
                <span style={{ flex:1, fontSize:'13px' }}>{it.nombre}</span>
                <span style={{ fontSize:'12px', color:'#718096' }}>${it.precio.toLocaleString()} c/u</span>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*"
                  value={it.cantidad}
                  onChange={e => {
                    const c = Math.max(1, parseInt(e.target.value) || 1);
                    setVentaEditando(prev => { const items = [...prev.items]; items[idx] = { ...items[idx], cantidad: c }; return { ...prev, items }; });
                  }}
                  style={{ width:'48px', textAlign:'center', border:'1px solid #cbd5e0', borderRadius:'4px', padding:'3px' }}
                />
                <span style={{ fontSize:'13px', fontWeight:600, minWidth:'70px', textAlign:'right' }}>${(it.precio * it.cantidad).toLocaleString()}</span>
                <button onClick={() => setVentaEditando(prev => ({ ...prev, items: prev.items.filter((_,i) => i !== idx) }))}
                  style={{ background:'#e53e3e', color:'white', border:'none', borderRadius:'4px', padding:'2px 7px', cursor:'pointer', fontSize:'13px' }}>✕</button>
              </div>
            ))}
            <div style={{ display:'flex', gap:'8px', marginTop:'8px', marginBottom:'16px' }}>
              <select value={productoAgregarEdit} onChange={e => setProductoAgregarEdit(e.target.value)}
                style={{ flex:1, padding:'6px', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'13px' }}>
                <option value="">— Agregar producto —</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (${p.precio.toLocaleString()})</option>
                ))}
              </select>
              <button onClick={() => {
                const prod = productos.find(p => String(p.id) === String(productoAgregarEdit));
                if (!prod) return;
                setVentaEditando(prev => {
                  const existe = prev.items.findIndex(it => it.id === prod.id);
                  if (existe >= 0) {
                    const items = [...prev.items];
                    items[existe] = { ...items[existe], cantidad: items[existe].cantidad + 1 };
                    return { ...prev, items };
                  }
                  return { ...prev, items: [...prev.items, { id: prod.id, nombre: prod.nombre, cantidad: 1, precio: prod.precio }] };
                });
                setProductoAgregarEdit('');
              }} style={{ background:'#48bb78', color:'white', border:'none', borderRadius:'6px', padding:'6px 14px', cursor:'pointer', fontWeight:600 }}>+ Agregar</button>
            </div>

            {/* Pagos */}
            <h4 style={{ margin:'0 0 8px', color:'#4a5568' }}>Medios de pago</h4>
            {ventaEditando.pagos.map((p, idx) => (
              <div key={idx} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', background:'#f8f9fa', padding:'6px 10px', borderRadius:'6px' }}>
                <select value={p.metodo} onChange={e => setVentaEditando(prev => { const pagos=[...prev.pagos]; pagos[idx]={...pagos[idx], metodo:e.target.value}; return {...prev,pagos}; })}
                  style={{ flex:1, padding:'4px', border:'1px solid #cbd5e0', borderRadius:'4px', fontSize:'13px' }}>
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                  <option value="DÉBITO">DÉBITO</option>
                </select>
                <input type="text" inputMode="numeric" pattern="[0-9]*"
                  value={p.monto}
                  onChange={e => setVentaEditando(prev => { const pagos=[...prev.pagos]; pagos[idx]={...pagos[idx], monto:parseInt(e.target.value)||0}; return {...prev,pagos}; })}
                  style={{ width:'90px', textAlign:'right', border:'1px solid #cbd5e0', borderRadius:'4px', padding:'3px 6px', fontSize:'13px' }}
                />
                <button onClick={() => setVentaEditando(prev => ({ ...prev, pagos: prev.pagos.filter((_,i) => i !== idx) }))}
                  style={{ background:'#e53e3e', color:'white', border:'none', borderRadius:'4px', padding:'2px 7px', cursor:'pointer', fontSize:'13px' }}>✕</button>
              </div>
            ))}
            <button onClick={() => setVentaEditando(prev => ({ ...prev, pagos: [...prev.pagos, { metodo:'EFECTIVO', monto:0 }] }))}
              style={{ background:'#667eea', color:'white', border:'none', borderRadius:'6px', padding:'5px 12px', cursor:'pointer', fontSize:'13px', marginBottom:'16px' }}>+ Agregar pago</button>

            {/* Totales */}
            {(() => {
              const totItems = ventaEditando.items.reduce((s,it) => s + it.precio * it.cantidad, 0);
              const totPagos = ventaEditando.pagos.reduce((s,p) => s + Number(p.monto||0), 0);
              const ok = Math.abs(totItems - totPagos) <= 0.01;
              return (
                <div style={{ background:'#f0f4ff', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'14px', marginBottom:'4px' }}>
                    <span>Total productos:</span><span style={{ fontWeight:700 }}>${totItems.toLocaleString()}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'14px', marginBottom:'4px' }}>
                    <span>Total pagos:</span><span style={{ fontWeight:700, color: ok ? '#38a169' : '#e53e3e' }}>${totPagos.toLocaleString()}</span>
                  </div>
                  {!ok && <div style={{ color:'#e53e3e', fontSize:'12px', marginTop:'4px' }}>Los totales no coinciden</div>}
                </div>
              );
            })()}

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={() => setVentaEditando(null)} style={{ background:'#e2e8f0', color:'#4a5568', border:'none', borderRadius:'8px', padding:'8px 20px', cursor:'pointer', fontWeight:600 }}>Cancelar</button>
              <button onClick={guardarEdicionVenta} style={{ background:'#667eea', color:'white', border:'none', borderRadius:'8px', padding:'8px 20px', cursor:'pointer', fontWeight:600 }}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return <AppInner />;
}