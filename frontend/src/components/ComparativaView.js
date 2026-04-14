import { useState } from 'react';
import { fechaLocal, calcularMetricasMedios } from '../utils/reportes';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getISOWeekStart(year, week) {
  const jan4 = new Date(year, 0, 4);
  const dow = (jan4.getDay() + 6) % 7;
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() - dow);
  const result = new Date(week1Start);
  result.setDate(week1Start.getDate() + (week - 1) * 7);
  return result;
}

function getWeeksInYear(year) {
  return getISOWeek(new Date(year, 11, 28));
}

function etiquetaPeriodo(p) {
  if (!p) return '';
  if (p.tipo === 'mes') return `${MESES[p.mes]} ${p.año}`;
  if (p.tipo === 'año') return `${p.año}`;
  if (p.tipo === 'semana') {
    const ini = getISOWeekStart(p.año, p.semana);
    const fin = new Date(ini); fin.setDate(fin.getDate() + 6);
    const fmt = d => d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    return `Sem. ${p.semana} (${fmt(ini)}–${fmt(fin)} ${p.año})`;
  }
  if (p.tipo === 'personalizado') return `${p.desde} → ${p.hasta}`;
  return '';
}

function filtrarVentas(ventas, p) {
  return ventas.filter(v => {
    if (v.estado === 'cancelada') return false;
    const fecha = new Date(v.fecha);
    const fStr = fechaLocal(v.fecha);
    if (p.tipo === 'mes') return fecha.getFullYear() === p.año && fecha.getMonth() === p.mes;
    if (p.tipo === 'año') return fecha.getFullYear() === p.año;
    if (p.tipo === 'semana') {
      const ini = getISOWeekStart(p.año, p.semana);
      const fin = new Date(ini); fin.setDate(fin.getDate() + 6); fin.setHours(23, 59, 59, 999);
      return fecha >= ini && fecha <= fin;
    }
    if (p.tipo === 'personalizado') return fStr >= p.desde && fStr <= p.hasta;
    return false;
  });
}

function calcStats(ventas) {
  const total = ventas.reduce((s, v) => s + (parseFloat(v.total) || 0), 0);
  const cant = ventas.length;
  const promedio = cant > 0 ? total / cant : 0;
  const productos = ventas.reduce((s, v) => s + (v.items || []).reduce((ss, it) => ss + (parseInt(it.cantidad) || 0), 0), 0);
  const medios = calcularMetricasMedios(ventas);
  return { total, cant, promedio, productos, medios };
}

function fmtPct(a, b) {
  if (b === 0 && a === 0) return '—';
  if (b === 0) return '+100%';
  const pct = ((a - b) / b * 100);
  const s = pct.toFixed(1);
  return pct > 0 ? `+${s}%` : `${s}%`;
}

function colorPct(a, b) {
  if (a === b) return '#718096';
  return a > b ? '#38a169' : '#e53e3e';
}

function fmtPesos(n) {
  return `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

function SelectorPeriodo({ label, valor, onChange }) {
  const hoy = new Date();
  const años = [];
  for (let y = hoy.getFullYear(); y >= 2024; y--) años.push(y);

  const semanas = Array.from({ length: getWeeksInYear(valor.año) }, (_, i) => i + 1);

  const set = (campo, val) => onChange({ ...valor, [campo]: val });

  return (
    <div style={{ flex: 1, background: '#f8f9ff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', color: '#4a5568', marginBottom: '12px' }}>{label}</div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Tipo de período</label>
        <select value={valor.tipo} onChange={e => set('tipo', e.target.value)}
          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
          <option value="mes">Mes</option>
          <option value="año">Año</option>
          <option value="semana">Semana</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>

      {valor.tipo === 'mes' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Mes</label>
            <select value={valor.mes} onChange={e => set('mes', Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Año</label>
            <select value={valor.año} onChange={e => set('año', Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
              {años.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {valor.tipo === 'año' && (
        <div>
          <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Año</label>
          <select value={valor.año} onChange={e => set('año', Number(e.target.value))}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
            {años.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {valor.tipo === 'semana' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Semana</label>
            <select value={valor.semana} onChange={e => set('semana', Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
              {semanas.map(s => {
                const ini = getISOWeekStart(valor.año, s);
                const fin = new Date(ini); fin.setDate(fin.getDate() + 6);
                const fmt = d => d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                return <option key={s} value={s}>Sem. {s} ({fmt(ini)}–{fmt(fin)})</option>;
              })}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Año</label>
            <select value={valor.año} onChange={e => set('año', Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
              {años.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {valor.tipo === 'personalizado' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Desde</label>
            <input type="date" value={valor.desde} onChange={e => set('desde', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>Hasta</label>
            <input type="date" value={valor.hasta} onChange={e => set('hasta', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
      )}

      {etiquetaPeriodo(valor) && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#667eea', fontWeight: 600 }}>
          📅 {etiquetaPeriodo(valor)}
        </div>
      )}
    </div>
  );
}

export default function ComparativaView({ ventasDelDia }) {
  const hoy = new Date();
  const mesAnterior = hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1;
  const añoMesAnterior = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();

  const [periodoA, setPeriodoA] = useState({
    tipo: 'mes', mes: hoy.getMonth(), año: hoy.getFullYear(),
    semana: getISOWeek(hoy), desde: '', hasta: '',
  });
  const [periodoB, setPeriodoB] = useState({
    tipo: 'mes', mes: mesAnterior, año: añoMesAnterior,
    semana: getISOWeek(hoy) > 1 ? getISOWeek(hoy) - 1 : 1, desde: '', hasta: '',
  });

  const [resultado, setResultado] = useState(null);

  const comparar = () => {
    const vA = filtrarVentas(ventasDelDia, periodoA);
    const vB = filtrarVentas(ventasDelDia, periodoB);
    setResultado({ a: calcStats(vA), b: calcStats(vB), etA: etiquetaPeriodo(periodoA), etB: etiquetaPeriodo(periodoB) });
  };

  const filaMetrica = (label, valA, valB, fmt) => (
    <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
      <td style={{ padding: '10px 12px', color: '#4a5568', fontWeight: 600, fontSize: '13px' }}>{label}</td>
      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2d3748', fontSize: '13px' }}>{fmt(valA)}</td>
      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2d3748', fontSize: '13px' }}>{fmt(valB)}</td>
      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: '13px', color: colorPct(valA, valB) }}>
        {fmtPct(valA, valB)}
      </td>
    </tr>
  );

  return (
    <div className="dashboard-container">
      <h2 style={{ marginBottom: '20px' }}>📊 Comparativa de Períodos</h2>

      {/* Selectores */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <SelectorPeriodo label="Período A" valor={periodoA} onChange={setPeriodoA} />
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '22px', color: '#a0aec0', padding: '8px' }}>vs</div>
        <SelectorPeriodo label="Período B" valor={periodoB} onChange={setPeriodoB} />
      </div>

      <button onClick={comparar}
        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 32px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', marginBottom: '24px' }}>
        Comparar →
      </button>

      {/* Resultados */}
      {resultado && (
        <>
          {/* Métricas principales */}
          <div className="top-productos" style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#2d3748', marginBottom: '12px' }}>📈 Métricas Generales</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#4a5568' }}>Métrica</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#667eea' }}>{resultado.etA}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#764ba2' }}>{resultado.etB}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#4a5568' }}>Variación</th>
                </tr>
              </thead>
              <tbody>
                {filaMetrica('Total vendido', resultado.a.total, resultado.b.total, fmtPesos)}
                {filaMetrica('Cantidad de ventas', resultado.a.cant, resultado.b.cant, n => n)}
                {filaMetrica('Ticket promedio', resultado.a.promedio, resultado.b.promedio, fmtPesos)}
                {filaMetrica('Productos vendidos', resultado.a.productos, resultado.b.productos, n => `${n} u.`)}
              </tbody>
            </table>
          </div>

          {/* Medios de pago */}
          <div className="top-productos">
            <h3 style={{ color: '#2d3748', marginBottom: '12px' }}>💳 Medios de Pago</h3>
            {(() => {
              const todosMetodos = Array.from(new Set([
                ...resultado.a.medios.lista.map(m => m.metodo),
                ...resultado.b.medios.lista.map(m => m.metodo),
              ]));
              if (todosMetodos.length === 0) return (
                <div style={{ color: '#999', padding: '12px' }}>Sin ventas en ninguno de los períodos</div>
              );
              return (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#4a5568' }}>Medio</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', color: '#667eea' }}>{resultado.etA}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', color: '#764ba2' }}>{resultado.etB}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', color: '#4a5568' }}>Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todosMetodos.map(metodo => {
                      const mA = resultado.a.medios.lista.find(m => m.metodo === metodo);
                      const mB = resultado.b.medios.lista.find(m => m.metodo === metodo);
                      const montoA = mA?.monto || 0;
                      const montoB = mB?.monto || 0;
                      return (
                        <tr key={metodo} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px 12px', color: '#4a5568', fontWeight: 600 }}>{metodo}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2d3748' }}>{fmtPesos(montoA)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2d3748' }}>{fmtPesos(montoB)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: colorPct(montoA, montoB) }}>{fmtPct(montoA, montoB)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>

          {(resultado.a.cant === 0 && resultado.b.cant === 0) && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#fff5f5', borderRadius: '8px', color: '#e53e3e', textAlign: 'center' }}>
              Sin ventas en ninguno de los dos períodos seleccionados.
            </div>
          )}
          {(resultado.a.cant === 0 && resultado.b.cant > 0) && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#fffbeb', borderRadius: '8px', color: '#d69e2e', textAlign: 'center' }}>
              Sin ventas en el Período A.
            </div>
          )}
          {(resultado.a.cant > 0 && resultado.b.cant === 0) && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#fffbeb', borderRadius: '8px', color: '#d69e2e', textAlign: 'center' }}>
              Sin ventas en el Período B.
            </div>
          )}
        </>
      )}
    </div>
  );
}
