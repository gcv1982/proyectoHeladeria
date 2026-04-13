
// ── Utilidades de fechas ──────────────────────────────────────────────────────

export const fechaLocal = (fechaStr) => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ── Filtros de ventas ─────────────────────────────────────────────────────────

export const filtrarVentasPorPeriodo = (ventasDelDia, periodoSeleccionado) => {
  const hoy = new Date();
  if (!ventasDelDia || ventasDelDia.length === 0) return [];
  if (periodoSeleccionado === 'HOY') {
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
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
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    return ventasDelDia.filter(v => {
      const fv = new Date(v.fecha);
      return fv.getMonth() === mes && fv.getFullYear() === anio;
    });
  }
  return ventasDelDia;
};

// ── Métricas ──────────────────────────────────────────────────────────────────

export const calcularMetricasMedios = (ventas) => {
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
    porcentaje: total ? Math.round((resumen[m] * 100) / total) : 0,
  }));
  lista.sort((a, b) => b.monto - a.monto);
  return { resumen, lista, total };
};

export const calcularMetricas = (ventasDelDia, periodoSeleccionado) => {
  const ventas = filtrarVentasPorPeriodo(ventasDelDia, periodoSeleccionado);
  const totalVentas = ventas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0);
  const cantidadVentas = ventas.length;
  const cantidadProductos = ventas.reduce((sum, v) => {
    const items = v.items || [];
    return sum + items.reduce((s, it) => s + (parseInt(it.cantidad) || 0), 0);
  }, 0);
  const ventaPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;
  return { totalVentas, cantidadVentas, cantidadProductos, ventaPromedio };
};

// ── Reportes ──────────────────────────────────────────────────────────────────

export const generarReporteSemanal = (ventasDelDia) => {
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

export const generarReporteMensual = (ventasDelDia) => {
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

// ── Caja ──────────────────────────────────────────────────────────────────────

export const calcularResumenCaja = (inicioCaja, ventasDelDia, retiros, gastos, cierreTotalContado) => {
  const montoInicial = inicioCaja ? inicioCaja.montoInicial : 0;
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const fechaDesdeApertura = inicioCaja?.fecha ? fechaLocal(inicioCaja.fecha) : fechaHoy;
  const ventasHoy = ventasDelDia.filter(v => fechaLocal(v.fecha) >= fechaDesdeApertura);
  const totalVentas = ventasHoy.reduce((sum, v) => {
    const efectivoDelVenta = v.pagos?.reduce((pSum, p) =>
      p.metodo === 'EFECTIVO' ? pSum + (parseFloat(p.monto) || 0) : pSum, 0) || 0;
    return sum + efectivoDelVenta;
  }, 0);
  const retirosSum = retiros.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const gastosSum = gastos.reduce((s, g) => s + (parseFloat(g.monto) || 0), 0);
  const totalEsperado = montoInicial + totalVentas - retirosSum - gastosSum;
  const totalReal = cierreTotalContado;
  const diferencia = totalReal - totalEsperado;
  return { montoInicial, totalVentas, retiros: retirosSum, gastos: gastosSum, totalEsperado, totalReal, diferencia };
};
