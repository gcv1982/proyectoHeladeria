
import React, { useState } from 'react';
import './App.css';

function App() {
  // Lista de productos de venta
 const productos = [
  // ========== GRANEL ==========
  { id: 7, nombre: 'Baño de Chocolate', precio: 500, categoria: 'EXTRAS' },
  { id: 8, nombre: '1/4 kg', precio: 4000, categoria: 'GRANEL' },
  { id: 9, nombre: '1/2 kg', precio: 7000, categoria: 'GRANEL' },
  { id: 10, nombre: '1 kg', precio: 12000, categoria: 'GRANEL' },
  { id: 11, nombre: 'Batido', precio: 3600, categoria: 'BATIDOS' },
  { id: 12, nombre: 'Batido Nesquik', precio: 4000, categoria: 'BATIDOS' },
  { id: 13, nombre: 'Sundae Go', precio: 3500, categoria: 'BATIDOS' },
  { id: 14, nombre: 'Smoothie', precio: 3900, categoria: 'BATIDOS' },
  { id: 15, nombre: 'Yogurt', precio: 2300, categoria: 'GRANEL' },
  { id: 16, nombre: 'Helado s/Az', precio: 2300, categoria: 'GRANEL' },
  { id: 17, nombre: 'Postre Veg', precio: 2300, categoria: 'GRANEL' },

  // ========== POSTRES/BOMBONES ==========
  { id: 18, nombre: 'Almendrado x1', precio: 1500, categoria: 'POSTRES' },
  { id: 19, nombre: 'Almendrado x8', precio: 9000, categoria: 'POSTRES' },
  { id: 20, nombre: 'Cassatta x1', precio: 1500, categoria: 'POSTRES' },
  { id: 21, nombre: 'Cassatta x8', precio: 9000, categoria: 'POSTRES' },
  { id: 22, nombre: 'Crocante x1', precio: 1500, categoria: 'POSTRES' },
  { id: 23, nombre: 'Crocante x8', precio: 10800, categoria: 'POSTRES' },
  { id: 24, nombre: 'Frutezza x1', precio: 1500, categoria: 'POSTRES' },
  { id: 25, nombre: 'Frutezza x8', precio: 10800, categoria: 'POSTRES' },
  { id: 26, nombre: 'Suizo x1', precio: 1600, categoria: 'POSTRES' },
  { id: 27, nombre: 'Suizo x8', precio: 11900, categoria: 'POSTRES' },
  { id: 28, nombre: 'Escocés x1', precio: 1700, categoria: 'POSTRES' },
  { id: 29, nombre: 'Escocés x8', precio: 12500, categoria: 'POSTRES' },
  { id: 30, nombre: 'Alfajor Secreto x1', precio: 2200, categoria: 'POSTRES' },
  { id: 31, nombre: 'Alfajor Secreto x8', precio: 12500, categoria: 'POSTRES' },
  { id: 32, nombre: 'Crocantino', precio: 9000, categoria: 'POSTRES' },
  { id: 33, nombre: 'Delicias', precio: 9000, categoria: 'POSTRES' },
  // ========== TENTACIONES (orden alfabético)
  { id: 93, nombre: 'Chocolate', precio: 7500, categoria: 'TENTACIONES' },
  { id: 99, nombre: 'Crema Americana', precio: 7500, categoria: 'TENTACIONES' },
  { id: 102, nombre: 'Crema Cookie', precio: 7500, categoria: 'TENTACIONES' },
  { id: 96, nombre: 'Dulce de Leche', precio: 7500, categoria: 'TENTACIONES' },
  { id: 97, nombre: 'Dulce de Leche Granizado', precio: 7500, categoria: 'TENTACIONES' },
  { id: 100, nombre: 'Frutilla', precio: 7500, categoria: 'TENTACIONES' },
  { id: 95, nombre: 'Granizado', precio: 7500, categoria: 'TENTACIONES' },
  { id: 98, nombre: 'Limón', precio: 7500, categoria: 'TENTACIONES' },
  { id: 94, nombre: 'Menta Granizado', precio: 7500, categoria: 'TENTACIONES' },
  { id: 101, nombre: 'Vainilla', precio: 7500, categoria: 'TENTACIONES' },
  // Eliminados: 'Tentación 1lt' y 'Familiar 3lts' por solicitud (antes ids 34 y 35)

  // ========== CUCURUCHOS ==========
  { id: 103, nombre: '1 Bocha', precio: 2200, categoria: 'CUCURUCHOS' },
  { id: 104, nombre: '2 Bochas', precio: 2900, categoria: 'CUCURUCHOS' },
  { id: 105, nombre: '3 Bochas', precio: 3200, categoria: 'CUCURUCHOS' },
  { id: 106, nombre: 'GRIDO 2 Bochas', precio: 3100, categoria: 'CUCURUCHOS' },
  { id: 107, nombre: 'GRIDO 3 Bochas', precio: 3500, categoria: 'CUCURUCHOS' },
  { id: 108, nombre: 'Super Gridito', precio: 2300, categoria: 'CUCURUCHOS' },

  // ========== PALITOS ==========
  { id: 36, nombre: 'Palito Bombón x1', precio: 800, categoria: 'PALITOS' },
  { id: 37, nombre: 'Palito Bombón x10', precio: 6800, categoria: 'PALITOS' },
  { id: 38, nombre: 'Palito Bombón x20', precio: 13600, categoria: 'PALITOS' },
  { id: 39, nombre: 'Palito Cremoso x1', precio: 700, categoria: 'PALITOS' },
  { id: 40, nombre: 'Palito Cremoso x10', precio: 5300, categoria: 'PALITOS' },
  { id: 41, nombre: 'Palito Cremoso x20', precio: 10500, categoria: 'PALITOS' },
  { id: 42, nombre: 'Palito Frutal x1', precio: 600, categoria: 'PALITOS' },
  { id: 43, nombre: 'Palito Frutal x10', precio: 4800, categoria: 'PALITOS' },
  { id: 44, nombre: 'Palito Frutal x20', precio: 9500, categoria: 'PALITOS' },

  // ========== TORTAS ==========
  { id: 45, nombre: 'Torta Frutilla', precio: 13500, categoria: 'TORTAS' },
  { id: 86, nombre: 'Torta Grido', precio: 13500, categoria: 'TORTAS' },
  { id: 87, nombre: 'Torta Oreo', precio: 13500, categoria: 'TORTAS' },



  // ========== PIZZAS ==========
  { id: 46, nombre: 'Pizza Mozzarella', precio: 5600, categoria: 'PIZZAS' },
  { id: 47, nombre: 'Pizza Jamón', precio: 5900, categoria: 'PIZZAS' },
  { id: 48, nombre: 'Pizza Cebolla', precio: 5600, categoria: 'PIZZAS' },
  { id: 49, nombre: 'Pizza Casera', precio: 7800, categoria: 'PIZZAS' },
  { id: 50, nombre: 'Mini Pizza', precio: 2900, categoria: 'PIZZAS' },
  { id: 51, nombre: 'Bastones', precio: 5100, categoria: 'PIZZAS' },
  { id: 52, nombre: 'Pechugas', precio: 5100, categoria: 'PIZZAS' },
  { id: 53, nombre: 'Empanadas', precio: 7800, categoria: 'PIZZAS' },

  // ========== EXTRAS ==========
  { id: 54, nombre: 'Blister x3', precio: 800, categoria: 'EXTRAS' },
  { id: 55, nombre: 'Topping x1', precio: 550, categoria: 'EXTRAS' },
  { id: 56, nombre: 'Topping x2', precio: 1000, categoria: 'EXTRAS' },
  { id: 57, nombre: 'Salsita 15gr', precio: 550, categoria: 'EXTRAS' },
  { id: 58, nombre: 'Bengala Común', precio: 600, categoria: 'EXTRAS' },
  { id: 59, nombre: 'Bengala Brillo', precio: 1000, categoria: 'EXTRAS' },
  { id: 60, nombre: 'Block 38gr', precio: 1400, categoria: 'EXTRAS' },
  { id: 61, nombre: 'Block 110gr', precio: 4200, categoria: 'EXTRAS' },
  { id: 62, nombre: 'Block 170gr', precio: 7000, categoria: 'EXTRAS' },
  { id: 63, nombre: 'Block 300gr', precio: 10800, categoria: 'EXTRAS' },
  { id: 64, nombre: 'Graffiti 45gr', precio: 1500, categoria: 'EXTRAS' },
  { id: 65, nombre: 'Roclets 40gr', precio: 1400, categoria: 'EXTRAS' },
  { id: 66, nombre: 'Maní c/Choco', precio: 1100, categoria: 'EXTRAS' },
  { id: 67, nombre: 'Cofler Tofi/Bon', precio: 800, categoria: 'EXTRAS' },
  { id: 68, nombre: 'Cofler 55gr', precio: 2700, categoria: 'EXTRAS' },
  { id: 69, nombre: 'Gelatinas', precio: 700, categoria: 'EXTRAS' },

  // ========== BEBIDAS ==========
  { id: 70, nombre: 'Gaseosa 1.5lt', precio: 0, categoria: 'BEBIDAS' },
  { id: 71, nombre: 'Gaseosa 500ml', precio: 1700, categoria: 'BEBIDAS' },
  { id: 72, nombre: 'Lata', precio: 1400, categoria: 'BEBIDAS' },
  { id: 73, nombre: 'Baggio', precio: 700, categoria: 'BEBIDAS' },
  { id: 74, nombre: 'Agua 500ml', precio: 1000, categoria: 'BEBIDAS' },
  { id: 75, nombre: 'Agua 2lt', precio: 2000, categoria: 'BEBIDAS' },

  // ========== PROMOCIONES ==========
  { id: 76, nombre: '2 de 2 Bochas', precio: 5500, categoria: 'PROMOCIONES' },
  { id: 77, nombre: '2 de 1/4', precio: 7500, categoria: 'PROMOCIONES' },
  { id: 78, nombre: 'kg + medio', precio: 17500, categoria: 'PROMOCIONES' },
  { id: 79, nombre: '2 Kilos', precio: 22000, categoria: 'PROMOCIONES' },
  { id: 80, nombre: '2 Bocha TOY', precio: 3900, categoria: 'PROMOCIONES' },
  { id: 81, nombre: '3x2 Alm o Cas', precio: 19000, categoria: 'PROMOCIONES' },
  { id: 82, nombre: '2 Escocés', precio: 23000, categoria: 'PROMOCIONES' },
  { id: 83, nombre: 'Kilo Reutilizable', precio: 20000, categoria: 'PROMOCIONES' },
  { id: 84, nombre: 'Recarga Kilo', precio: 10800, categoria: 'PROMOCIONES' },
  { id: 85, nombre: 'Promo Navidad', precio: 20000, categoria: 'PROMOCIONES' },
  // Eliminado: 'Familiar 1lt' por solicitud (antes id 88)
  { id: 89, nombre: 'Familiar nro 1', precio: 13900, categoria: 'FAMILIARES' },
  { id: 90, nombre: 'Familiar nro 2', precio: 13900, categoria: 'FAMILIARES' },
  { id: 91, nombre: 'Familiar nro 3', precio: 13900, categoria: 'FAMILIARES' },
  { id: 92, nombre: 'Familiar nro 4', precio: 13900, categoria: 'FAMILIARES' },
];

  // Estado del carrito
  // Categorías disponibles
  
  const categorias = ['GRANEL', 'POSTRES', 'PALITOS', 'TORTAS', 'PIZZAS', 'EXTRAS', 'BEBIDAS', 'PROMOCIONES', 'FAMILIARES', 'TENTACIONES', 'CUCURUCHOS', 'BATIDOS'];
  const [carrito, setCarrito] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('HOY');
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [pagosSeleccionados, setPagosSeleccionados] = useState([]);
  const [mostrarCaja, setMostrarCaja] = useState(false);
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [inicioCaja, setInicioCaja] = useState(null);
  const [ventasDelDia, setVentasDelDia] = useState([]);
  const [denominacionesInicio, setDenominacionesInicio] = useState({
  billete10000: 0,
  billete2000: 0,
  billete1000: 0,
  billete500: 0,
  billete200: 0,
  billete100: 0,
  moneda50: 0,
  moneda20: 0,
  moneda10: 0
});
// Estado para cierre de caja
const [denominacionesCierre, setDenominacionesCierre] = useState({
  billete10000: 0,
  billete2000: 0,
  billete1000: 0,
  billete500: 0,
  billete200: 0,
  billete100: 0,
  moneda50: 0,
  moneda20: 0,
  moneda10: 0
});

  const ventasSimuladas = [
  { id: 1, fecha: '2025-01-06', producto: 'Cucurucho 2 bochas', cantidad: 5, precio: 2900, total: 14500 },
  { id: 2, fecha: '2025-01-06', producto: 'Palito Bombón x1', cantidad: 10, precio: 800, total: 8000 },
  { id: 3, fecha: '2025-01-06', producto: '1/4 kg', cantidad: 3, precio: 4000, total: 12000 },
  { id: 4, fecha: '2025-01-06', producto: 'Torta Frutilla', cantidad: 2, precio: 13500, total: 27000 },
  { id: 5, fecha: '2025-01-06', producto: 'Pizza Mozzarella', cantidad: 4, precio: 5600, total: 22400 },
  { id: 6, fecha: '2025-01-05', producto: 'Cucurucho 2 bochas', cantidad: 8, precio: 2900, total: 23200 },
  { id: 7, fecha: '2025-01-05', producto: 'Palito Cremoso x1', cantidad: 6, precio: 700, total: 4200 },
  { id: 8, fecha: '2025-01-04', producto: '1/2 kg', cantidad: 5, precio: 7000, total: 35000 },
  { id: 9, fecha: '2025-01-04', producto: 'Torta Oreo', cantidad: 1, precio: 13500, total: 13500 },
  { id: 10, fecha: '2024-12-30', producto: 'Cucurucho 3 bochas', cantidad: 12, precio: 3200, total: 38400 },
];

  // Función para agregar producto al carrito
  const agregarAlCarrito = (producto) => {
  const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      // Si ya existe, aumentar cantidad
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item , cantidad : item.cantidad + 1 }
          : item
      ));
    } else {
      // Si no existe, agregarlo con cantidad 1
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };


 // Función para calcular el total
const calcularTotal = () => {
  return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};
  
  // Función para limpiar el carrito
  const limpiarCarrito = () => {
    setCarrito([]);
  };

  // Función para eliminar el producto seleccionado
const eliminarSeleccionado = () => {
  if (seleccionado !== null) {
    const item = carrito.find(item => item.id === seleccionado);
    
    if (item.cantidad > 1) {
      // Si tiene más de 1, restar 1
      setCarrito(carrito.map(producto =>
        producto.id === seleccionado
          ? { ...producto, cantidad: producto.cantidad - 1 }
          : producto
      ));
    } else {
      // Si tiene 1, eliminar completamente
      setCarrito(carrito.filter(producto => producto.id !== seleccionado));
      setSeleccionado(null);
    }
  }
};


  // Función para cobrar (por ahora solo limpia)

 const cobrar = () => {

  console.log('COBRAR clickeado!');
  if (carrito.length === 0) {
    alert('El carrito está vacío');
    return;
  }
  setMostrarModalPago(true);
};

const agregarMetodoPago = (metodo) => {
  const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  // Si no hay métodos seleccionados, agregar el primero
  if (pagosSeleccionados.length === 0) {
    setPagosSeleccionados([{ metodo, monto: totalVenta }]);
  } else {
    // Si ya hay uno, agregar el segundo
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

const confirmarVenta = () => {
  const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalPagos = pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0);
  
  if (Math.abs(totalPagos - totalVenta) > 0.01) {
    alert(`Error: El total de pagos ($${totalPagos.toLocaleString()}) no coincide con el total de la venta ($${totalVenta.toLocaleString()})`);
    return;
  }
  
  // Aquí después conectaremos con el backend
  console.log('=== VENTA CONFIRMADA ===');
  console.log('Métodos de pago:', pagosSeleccionados);
  console.log('Total:', totalVenta);
  console.log('Productos:', carrito);
  
  alert(`Venta registrada!\nTotal: $${totalVenta.toLocaleString()}\nMétodos: ${pagosSeleccionados.map(p => `${p.metodo} $${p.monto.toLocaleString()}`).join(', ')}`);
  
  // Cerrar modal, limpiar carrito y pagos
  setMostrarModalPago(false);
  setPagosSeleccionados([]);
  limpiarCarrito();
};

const cancelarVenta = () => {
  setMostrarModalPago(false);
  setPagosSeleccionados([]);
};

// Funciones del Dashboard
const filtrarVentasPorPeriodo = () => {
  const hoy = new Date('2025-01-06'); // Simular fecha actual
  
  if (periodoSeleccionado === 'HOY') {
    return ventasSimuladas.filter(v => v.fecha === '2025-01-06');
  } else if (periodoSeleccionado === 'SEMANA') {
    // Últimos 7 días
    return ventasSimuladas.filter(v => {
      const fechaVenta = new Date(v.fecha);
      const diferencia = (hoy - fechaVenta) / (1000 * 60 * 60 * 24);
      return diferencia <= 7;
    });
  } else if (periodoSeleccionado === 'MES') {
    // Último mes
    return ventasSimuladas.filter(v => {
      const fechaVenta = new Date(v.fecha);
      return fechaVenta.getMonth() === hoy.getMonth();
    });
  }
  return ventasSimuladas;
  
};

const calcularMetricas = () => {
  const ventas = filtrarVentasPorPeriodo();
  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
  const cantidadVentas = ventas.length;
  const cantidadProductos = ventas.reduce((sum, v) => sum + v.cantidad, 0);
  const ventaPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;
  
  return {
    totalVentas,
    cantidadVentas,
    cantidadProductos,
    ventaPromedio
  };
};

const obtenerTop5Productos = () => {
  const ventas = filtrarVentasPorPeriodo();
  
  // Agrupar por producto
  const agrupado = {};
  ventas.forEach(v => {
    if (!agrupado[v.producto]) {
      agrupado[v.producto] = { nombre: v.producto, cantidad: 0, total: 0 };
    }
    agrupado[v.producto].cantidad += v.cantidad;
    agrupado[v.producto].total += v.total;
  });
  
  // Convertir a array y ordenar por cantidad
  return Object.values(agrupado)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
};

  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  // Funciones de Caja
const calcularTotalInicio = () => {
  return (
    denominacionesInicio.billete10000 * 10000 +
    denominacionesInicio.billete2000 * 2000 +
    denominacionesInicio.billete1000 * 1000 +
    denominacionesInicio.billete500 * 500 +
    denominacionesInicio.billete200 * 200 +
    denominacionesInicio.billete100 * 100 +
    denominacionesInicio.moneda50 * 50 +
    denominacionesInicio.moneda20 * 20 +
    denominacionesInicio.moneda10 * 10
  );
};

const actualizarDenominacion = (tipo, cantidad) => {
  setDenominacionesInicio({
    ...denominacionesInicio,
    [tipo]: parseInt(cantidad) || 0
  });
};

const confirmarInicioCaja = () => {
  const total = calcularTotalInicio();
  
  if (total === 0) {
    alert('Debe ingresar al menos una denominación');
    return;
  }
  
  const datosCaja = {
    fecha: new Date().toISOString(),
    montoInicial: total,
    denominaciones: { ...denominacionesInicio }
  };
  
  setInicioCaja(datosCaja);
  setCajaAbierta(true);
  setMostrarCaja(false);
  
  console.log('=== CAJA ABIERTA ===');
  console.log('Monto inicial:', total);
  console.log('Fecha:', new Date().toLocaleString());
  
  alert(`Caja abierta exitosamente\nMonto inicial: $${total.toLocaleString()}`);
};
  const calcularTotalCierre = () => {
  return (
    denominacionesCierre.billete10000 * 10000 +
    denominacionesCierre.billete2000 * 2000 +
    denominacionesCierre.billete1000 * 1000 +
    denominacionesCierre.billete500 * 500 +
    denominacionesCierre.billete200 * 200 +
    denominacionesCierre.billete100 * 100 +
    denominacionesCierre.moneda50 * 50 +
    denominacionesCierre.moneda20 * 20 +
    denominacionesCierre.moneda10 * 10
  );
};

const actualizarDenominacionCierre = (tipo, cantidad) => {
  setDenominacionesCierre({
    ...denominacionesCierre,
    [tipo]: parseInt(cantidad) || 0
  });
};

const calcularResumenCaja = () => {
  const montoInicial = inicioCaja ? inicioCaja.montoInicial : 0;
  const totalVentas = ventasDelDia.reduce((sum, v) => sum + v.total, 0);
  const retiros = 0; // Por ahora en 0, después se puede agregar funcionalidad
  const totalEsperado = montoInicial + totalVentas - retiros;
  const totalReal = calcularTotalCierre();
  const diferencia = totalReal - totalEsperado;
  
  return {
    montoInicial,
    totalVentas,
    retiros,
    totalEsperado,
    totalReal,
    diferencia
  };
};

const confirmarCierreCaja = () => {
  const resumen = calcularResumenCaja();
  
  if (resumen.totalReal === 0) {
    alert('Debe contar el efectivo en caja');
    return;
  }
  
  console.log('=== CIERRE DE CAJA ===');
  console.log('Resumen:', resumen);
  console.log('Fecha:', new Date().toLocaleString());
  
  // Aquí después guardaremos en el backend
  alert(`Cierre de caja exitoso\n\nEsperado: $${resumen.totalEsperado.toLocaleString()}\nReal: $${resumen.totalReal.toLocaleString()}\nDiferencia: $${resumen.diferencia.toLocaleString()}`);
  
  // Resetear todo
  setCajaAbierta(false);
  setInicioCaja(null);
  setVentasDelDia([]);
  setDenominacionesInicio({
    billete10000: 0,
    billete2000: 0,
    billete1000: 0,
    billete500: 0,
    billete200: 0,
    billete100: 0,
    moneda50: 0,
    moneda20: 0,
    moneda10: 0
  });
  setDenominacionesCierre({
    billete10000: 0,
    billete2000: 0,
    billete1000: 0,
    billete500: 0,
    billete200: 0,
    billete100: 0,
    moneda50: 0,
    moneda20: 0,
    moneda10: 0
  });
  setMostrarCaja(false);
};

  return (
  <div className="App">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto 30px' }}>
  <h1 style={{ margin: 0 }}>Grido Laspiur</h1>
  
  <div style={{ display: 'flex', gap: '10px' }}>
    <button 
      onClick={() => {
        setMostrarDashboard(false);
        setMostrarCaja(true);
      }}
      style={{
        padding: '12px 24px',
        background: cajaAbierta ? '#28a745' : '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '16px',
        fontFamily: 'Poppins'
      }}
    >
      {cajaAbierta ? 'Caja Abierta' : 'Abrir Caja'}
    </button>
    
    <button 
      onClick={() => {
        setMostrarCaja(false);
        setMostrarDashboard(!mostrarDashboard);
      }}
      style={{
        padding: '12px 24px',
        background: 'white',
        color: '#667eea',
        border: '2px solid white',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '16px',
        fontFamily: 'Poppins'
      }}
    >
      {mostrarDashboard ? '🛒 Volver a Ventas' : '📊 Dashboard'}
    </button>
  </div>
</div>

    {mostrarCaja ? (
  // VISTA DE CAJA

  <div className="caja-container">

     {!cajaAbierta ? (
  // INICIO DE CAJA
  <div className="inicio-caja">
    <h2>Inicio de Caja</h2>
    <p className="fecha-caja">📅 {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    <div className="denominaciones-grid">
      {/* Billetes */}
      <div className="denominacion-item">
        <label>💵 $10.000</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.billete10000}
          onChange={(e) => actualizarDenominacion('billete10000', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.billete10000 * 10000).toLocaleString()}</span>
      </div>

      <div className="denominacion-item">
        <label>💵 $2.000</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.billete2000}
          onChange={(e) => actualizarDenominacion('billete2000', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.billete2000 * 2000).toLocaleString()}</span>
      </div>

      <div className="denominacion-item">
        <label>💵 $1.000</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.billete1000}
          onChange={(e) => actualizarDenominacion('billete1000', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.billete1000 * 1000).toLocaleString()}</span>
      </div>

      <div className="denominacion-item">
        <label>💵 $500</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.billete500}
          onChange={(e) => actualizarDenominacion('billete500', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.billete500 * 500).toLocaleString()}</span>
      </div>

      <div className="denominacion-item">
        <label>💵 $200</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.billete200}
          onChange={(e) => actualizarDenominacion('billete200', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.billete200 * 200).toLocaleString()}</span>
      </div>

      <div className="denominacion-item">
        <label>💵 $100</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.billete100}
          onChange={(e) => actualizarDenominacion('billete100', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.billete100 * 100).toLocaleString()}</span>
      </div>

      {/* Monedas */}
      <div className="denominacion-item">
        <label>🪙 $50</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.moneda50}
          onChange={(e) => actualizarDenominacion('moneda50', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.moneda50 * 50).toLocaleString()}</span>
      </div>

      <div className="denominacion-item">
        <label>🪙 $20</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.moneda20}
          onChange={(e) => actualizarDenominacion('moneda20', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.moneda20 * 20).toLocaleString()}</span>
      </div>

      <div className="denominacion-item">
        <label>🪙 $10</label>
        <input
          type="number"
          min="0"
          value={denominacionesInicio.moneda10}
          onChange={(e) => actualizarDenominacion('moneda10', e.target.value)}
          placeholder="Cantidad"
        />
        <span className="subtotal">${(denominacionesInicio.moneda10 * 10).toLocaleString()}</span>
      </div>
    </div>

    <div className="total-inicio">
      <h3>Total Inicio de Caja:</h3>
      <h2>${calcularTotalInicio().toLocaleString()}</h2>
    </div>

    <div className="botones-caja">
      <button className="btn-confirmar-caja" onClick={confirmarInicioCaja}>
        ✓ Confirmar e Iniciar Caja
      </button>
      <button className="btn-cancelar-caja" onClick={() => setMostrarCaja(false)}>
        Cancelar
      </button>
    </div>
  </div>
    ) : (
  // CIERRE DE CAJA
  <div className="cierre-caja">
    <h2>Cierre de Caja</h2>
    <p className="fecha-caja">📅 {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    {/* Resumen lateral */}
    <div className="cierre-layout">
      {/* Columna izquierda: Conteo de efectivo */}
      <div className="cierre-conteo">
        <h3>💵 Contar Efectivo en Caja</h3>
        
        <div className="denominaciones-grid-cierre">
          <div className="denominacion-item">
            <label>💵 $10.000</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.billete10000}
              onChange={(e) => actualizarDenominacionCierre('billete10000', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.billete10000 * 10000).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>💵 $2.000</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.billete2000}
              onChange={(e) => actualizarDenominacionCierre('billete2000', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.billete2000 * 2000).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>💵 $1.000</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.billete1000}
              onChange={(e) => actualizarDenominacionCierre('billete1000', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.billete1000 * 1000).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>💵 $500</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.billete500}
              onChange={(e) => actualizarDenominacionCierre('billete500', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.billete500 * 500).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>💵 $200</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.billete200}
              onChange={(e) => actualizarDenominacionCierre('billete200', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.billete200 * 200).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>💵 $100</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.billete100}
              onChange={(e) => actualizarDenominacionCierre('billete100', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.billete100 * 100).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>🪙 $50</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.moneda50}
              onChange={(e) => actualizarDenominacionCierre('moneda50', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.moneda50 * 50).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>🪙 $20</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.moneda20}
              onChange={(e) => actualizarDenominacionCierre('moneda20', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.moneda20 * 20).toLocaleString()}</span>
          </div>

          <div className="denominacion-item">
            <label>🪙 $10</label>
            <input
              type="number"
              min="0"
              value={denominacionesCierre.moneda10}
              onChange={(e) => actualizarDenominacionCierre('moneda10', e.target.value)}
            />
            <span className="subtotal">${(denominacionesCierre.moneda10 * 10).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Columna derecha: Resumen */}
      <div className="cierre-resumen">
        <h3>📊 Resumen del Día</h3>
        
        <div className="resumen-item">
          <span>Inicio de Caja:</span>
          <span className="monto">${calcularResumenCaja().montoInicial.toLocaleString()}</span>
        </div>

        <div className="resumen-item">
          <span>Ventas del Día:</span>
          <span className="monto positivo">${calcularResumenCaja().totalVentas.toLocaleString()}</span>
        </div>

        <div className="resumen-item">
          <span>Retiros:</span>
          <span className="monto negativo">${calcularResumenCaja().retiros.toLocaleString()}</span>
        </div>

        <div className="resumen-divider"></div>

        <div className="resumen-item destacado">
          <span>Total Esperado:</span>
          <span className="monto">${calcularResumenCaja().totalEsperado.toLocaleString()}</span>
        </div>

        <div className="resumen-item destacado">
          <span>Plata en Caja:</span>
          <span className="monto">${calcularResumenCaja().totalReal.toLocaleString()}</span>
        </div>

        <div className="resumen-divider"></div>

        <div className={`resumen-item final ${calcularResumenCaja().diferencia === 0 ? 'correcto' : calcularResumenCaja().diferencia > 0 ? 'sobrante' : 'faltante'}`}>
          <span>Diferencia:</span>
          <span className="monto">${calcularResumenCaja().diferencia.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="botones-caja">
      <button className="btn-confirmar-caja" onClick={confirmarCierreCaja}>
        ✓ Confirmar Cierre de Caja
      </button>
      <button className="btn-cancelar-caja" onClick={() => setMostrarCaja(false)}>
        Cancelar
      </button>
    </div>
  </div>
)}
      
  </div>
) : mostrarDashboard ? (
  // DASHBOARD
  <div className="dashboard-container">
    <h2>📊 Dashboard de Ventas</h2>
    
    {/* Selector de período */}
    <div className="periodo-selector">
      <button 
        className={periodoSeleccionado === 'HOY' ? 'periodo-btn active' : 'periodo-btn'}
        onClick={() => setPeriodoSeleccionado('HOY')}
      >
        HOY
      </button>
      <button 
        className={periodoSeleccionado === 'SEMANA' ? 'periodo-btn active' : 'periodo-btn'}
        onClick={() => setPeriodoSeleccionado('SEMANA')}
      >
        ESTA SEMANA
      </button>
      <button 
        className={periodoSeleccionado === 'MES' ? 'periodo-btn active' : 'periodo-btn'}
        onClick={() => setPeriodoSeleccionado('MES')}
      >
        ESTE MES
      </button>
    </div>

    {/* Métricas principales */}
    <div className="dashboard-cards">
      <div className="dashboard-card verde">
        <div className="card-icono">💰</div>
        <div className="card-numero">${calcularMetricas().totalVentas.toLocaleString()}</div>
        <div className="card-titulo">Total Vendido</div>
      </div>

      <div className="dashboard-card azul">
        <div className="card-icono">🛒</div>
        <div className="card-numero">{calcularMetricas().cantidadVentas}</div>
        <div className="card-titulo">Ventas Realizadas</div>
      </div>

      <div className="dashboard-card naranja">
        <div className="card-icono">📦</div>
        <div className="card-numero">{calcularMetricas().cantidadProductos}</div>
        <div className="card-titulo">Productos Vendidos</div>
      </div>

      <div className="dashboard-card morado">
        <div className="card-icono">📈</div>
        <div className="card-numero">${calcularMetricas().ventaPromedio.toLocaleString('es-AR', {maximumFractionDigits: 0})}</div>
        <div className="card-titulo">Venta Promedio</div>
      </div>
    </div>

    {/* Top 5 Productos */}
    <div className="top-productos">
      <h3>🏆 Top 5 Productos Más Vendidos</h3>
      <div className="top-lista">
        {obtenerTop5Productos().map((prod, index) => (
          <div key={index} className="top-item">
            <div className="top-info">
              <span className="top-posicion">#{index + 1}</span>
              <span className="top-nombre">{prod.nombre}</span>
            </div>
            <div className="top-stats">
              <span className="top-cantidad">{prod.cantidad} unidades</span>
              <span className="top-total">${prod.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
) : (
  // PUNTO DE VENTA
  <div className="container">
        {/* Panel de productos */}
        <div className="productos">
  <h2>Productos</h2>
  
  {categoriaActiva === null ? (
    // Mostrar pestañas principales
    <div className="categorias-menu">
      {categorias.map(cat => (
        <button
          key={cat}
          className={`categoria-btn ${cat === 'TORTAS' ? 'torta-hero' : ''} ${cat === 'TENTACIONES' ? 'tentacion-hero' : ''} ${cat === 'PALITOS' ? 'palitos-hero' : ''} ${cat === 'PIZZAS' ? 'pizzas-hero' : ''} ${cat === 'FAMILIARES' ? 'familiar-hero' : ''} ${cat === 'CUCURUCHOS' ? 'cucuruchos-hero' : ''} ${cat === 'POSTRES' ? 'bombones-hero' : ''} ${cat === 'GRANEL' ? 'granel-hero' : ''} ${cat === 'BEBIDAS' ? 'bebidas-hero' : ''} ${cat === 'BATIDOS' ? 'batidos-hero' : ''}`}          aria-label={cat}
          onClick={() => setCategoriaActiva(cat)}
        >
           {cat !== 'TENTACIONES' && cat !== 'TORTAS' && cat !== 'PALITOS' && cat !== 'PIZZAS' && cat !== 'FAMILIARES' && cat !== 'CUCURUCHOS' && cat !== 'BOMBONES' && cat !== 'GRANEL' && cat !== 'BEBIDAS' && cat !== 'BATIDOS' && <span>{cat}</span>} 
         </button>
      ))}
    </div>
  ) : (
    // Mostrar productos de la categoría seleccionada
    <>
      <button 
        className="btn-volver"
        onClick={() => setCategoriaActiva(null)}
      >
        ← VOLVER A CATEGORÍAS
      </button>
      
      <h3>{categoriaActiva}</h3>
      
     <div className="productos-grid">
        {categoriaActiva === 'PALITOS' ? (
          // Agrupar palitos por su nombre base y mostrar cada grupo en una fila
          (() => {
            const palitos = productos.filter(p => p.categoria === 'PALITOS');
            const bases = Array.from(new Set(palitos.map(p => p.nombre.replace(/\s+x\d+$/, ''))));
            return (
              <div className="palitos-rows">
                {bases.map(base => {
                  const opciones = palitos.filter(p => p.nombre.startsWith(base));
                  return (
                    <div key={base} className="palitos-row">
                      {opciones.map(producto => (
                        <button
                          key={producto.id}
                          className="producto-btn"
                          onClick={() => agregarAlCarrito(producto)}
                        >
                          <div>{producto.nombre}</div>
                          <div className="precio">${producto.precio}</div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })()
        ) : (
          productos.filter(p => p.categoria === categoriaActiva).map(producto => (
            <button
              key={producto.id}
              className="producto-btn"
              onClick={() => agregarAlCarrito(producto)}
            >
              <div>{producto.nombre}</div>
              <div className="precio">${producto.precio}</div>
            </button>
          ))
        )}
      </div>
    </>
  )}
</div>

        {/* Panel del carrito */}
        <div className="carrito">
          <h2>Carrito</h2>
          {carrito.length === 0 ? (
            <p className="carrito-vacio">El carrito está vacío</p>
          ) : (
            <>
              <div className="carrito-items">
               {carrito.map(item => (
  <div 
    key={item.id} 
    className={`carrito-item ${seleccionado === item.id ? 'seleccionado' : ''}`}
    onClick={() => setSeleccionado(item.id)}
  >
    <span>{item.nombre}</span>
    <span>{item.cantidad}</span>
    <span className="item-total">${item.precio * item.cantidad}</span>
  </div>
))}
              </div>
              
              <div className="total">
               <h3>TOTAL: ${totalCarrito}</h3>
              </div>

              <div className="botones">
  <button className="btn-cobrar" onClick={cobrar}>
    COBRAR
  </button>
  <button 
    className="btn-borrar" 
    onClick={eliminarSeleccionado}
    disabled={seleccionado === null}
  >
    BORRAR
  </button>
<button className="btn-limpiar" onClick={limpiarCarrito}>
    LIMPIAR TODO
  </button>
</div>
            </>
          )}
        </div>
      </div>
    )}

    {/* Modal de Método de Pago */}
    {mostrarModalPago && (
      <div className="modal-overlay" onClick={cancelarVenta}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>💳 Método de Pago</h2>
          
          <div className="modal-total">
            <span>Total a cobrar:</span>
            <span className="modal-total-precio">
              ${carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toLocaleString()}
            </span>
          </div>

          {/* Métodos de pago seleccionados */}
          {pagosSeleccionados.length > 0 && (
            <div className="pagos-seleccionados">
              {pagosSeleccionados.map((pago, index) => (
                <div key={index} className="pago-item">
                  <span className="pago-metodo">{pago.metodo}</span>
                  <input
                    type="number"
                    className="pago-monto-input"
                    value={pago.monto}
                    onChange={(e) => actualizarMontoPago(index, e.target.value)}
                    placeholder="Monto"
                  />
                  <button 
                    className="pago-quitar"
                    onClick={() => quitarMetodoPago(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <div className="pago-total-parcial">
                <span>Total ingresado:</span>
                <span className={pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0) === carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) ? 'total-correcto' : 'total-incorrecto'}>
                  ${pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Botones de métodos de pago */}
          {pagosSeleccionados.length < 2 && (
            <div className="modal-botones">
              <button 
                className="metodo-pago-btn efectivo"
                onClick={() => agregarMetodoPago('EFECTIVO')}
              >
                💵 EFECTIVO
              </button>
              
              <button 
                className="metodo-pago-btn debito"
                onClick={() => agregarMetodoPago('DÉBITO')}
              >
                💳 DÉBITO
              </button>
              
              <button 
                className="metodo-pago-btn transferencia"
                onClick={() => agregarMetodoPago('TRANSFERENCIA')}
              >
                📱 TRANSFERENCIA
              </button>
            </div>
          )}

          {/* Botones de acción */}
          <div className="modal-acciones">
            {pagosSeleccionados.length > 0 && (
              <button 
                className="modal-confirmar"
                onClick={confirmarVenta}
              >
                ✓ CONFIRMAR VENTA
              </button>
            )}
            
            <button 
              className="modal-cancelar"
              onClick={cancelarVenta}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}

export default App;