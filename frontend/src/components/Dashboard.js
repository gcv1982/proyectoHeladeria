
import { useState } from 'react';
import {
  fechaLocal,
  filtrarVentasPorPeriodo,
  calcularMetricas,
  calcularMetricasMedios,
  generarReporteSemanal,
  generarReporteMensual,
} from '../utils/reportes';

function generarResumenDiario(ventasDelDia) {
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;

  const ventasHoy = ventasDelDia.filter(v => fechaLocal(v.fecha) === fechaHoy);
  const ventasAyer = ventasDelDia.filter(v => fechaLocal(v.fecha) === fechaAyer);

  const totalHoy = ventasHoy.reduce((s, v) => s + (parseFloat(v.total) || 0), 0);
  const totalAyer = ventasAyer.reduce((s, v) => s + (parseFloat(v.total) || 0), 0);

  const productosMap = {};
  ventasHoy.forEach(v => {
    (v.items || []).forEach(it => {
      const k = it.nombre || 'Desconocido';
      productosMap[k] = (productosMap[k] || 0) + (parseInt(it.cantidad) || 0);
    });
  });
  const topProducto = Object.entries(productosMap).sort((a, b) => b[1] - a[1])[0];

  if (ventasHoy.length === 0) return null;

  let mensaje = `Hoy realizaste ${ventasHoy.length} venta${ventasHoy.length !== 1 ? 's' : ''} por $${totalHoy.toLocaleString()}.`;
  if (topProducto) mensaje += ` Producto más vendido: ${topProducto[0]} (${topProducto[1]} u.).`;
  if (totalAyer > 0) {
    const diff = Math.round(((totalHoy - totalAyer) / totalAyer) * 100);
    if (diff > 0) mensaje += ` Vendiste un ${diff}% más que ayer.`;
    else if (diff < 0) mensaje += ` Vendiste un ${Math.abs(diff)}% menos que ayer.`;
    else mensaje += ` Igual que ayer.`;
  }
  return mensaje;
}

export default function Dashboard({
  ventasDelDia, periodoSeleccionado, setPeriodoSeleccionado,
  detalleDashboard, setDetalleDashboard,
  diaSeleccionado, setDiaSeleccionado,
  calMes, setCalMes, calAño, setCalAño,
  isAdmin, abrirEdicionVenta, eliminarVenta,
}) {
  const [ventaAEliminar, setVentaAEliminar] = useState(null);

  const ventasFiltradas = filtrarVentasPorPeriodo(ventasDelDia, periodoSeleccionado);
  const metricas = calcularMetricas(ventasDelDia, periodoSeleccionado);
  const resumenDiario = generarResumenDiario(ventasDelDia);

  const confirmarEliminar = () => {
    eliminarVenta(ventaAEliminar.id);
    setVentaAEliminar(null);
  };

  return (
    <>
    <div className="dashboard-container">
      <h2 style={{ marginBottom: '32px' }}>📊 Dashboard de Ventas</h2>

      {resumenDiario && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a6e 0%, #2d2d9e 100%)',
          color: 'white', borderRadius: '10px', padding: '14px 18px',
          marginBottom: '16px', fontSize: '14px', lineHeight: '1.5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          💡 {resumenDiario}
        </div>
      )}

      {/* Selector de período */}
      <div className="periodo-selector">
        <button className={periodoSeleccionado === 'HOY' ? 'periodo-btn active' : 'periodo-btn'} onClick={() => setPeriodoSeleccionado('HOY')}>HOY</button>
        <button className={periodoSeleccionado === 'SEMANA' ? 'periodo-btn active' : 'periodo-btn'} onClick={() => setPeriodoSeleccionado('SEMANA')}>ESTA SEMANA</button>
        <button className={periodoSeleccionado === 'MES' ? 'periodo-btn active' : 'periodo-btn'} onClick={() => setPeriodoSeleccionado('MES')}>ESTE MES</button>
      </div>

      {/* Cards */}
      <div className="dashboard-cards">
        <div className="dashboard-card verde"><div className="card-icono">💰</div><div className="card-numero">${metricas.totalVentas.toLocaleString()}</div><div className="card-titulo">Total Vendido</div></div>
        <div className="dashboard-card azul" style={{ cursor: 'pointer' }} onClick={() => setDetalleDashboard(detalleDashboard === 'ventas' ? null : 'ventas')}>
          <div className="card-icono">🛒</div><div className="card-numero">{metricas.cantidadVentas}</div>
          <div className="card-titulo">Ventas Realizadas</div>
          <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{detalleDashboard === 'ventas' ? '▲ cerrar' : '▼ ver detalle'}</div>
        </div>
        <div className="dashboard-card naranja" style={{ cursor: 'pointer' }} onClick={() => setDetalleDashboard(detalleDashboard === 'productos' ? null : 'productos')}>
          <div className="card-icono">📦</div><div className="card-numero">{metricas.cantidadProductos}</div>
          <div className="card-titulo">Productos Vendidos</div>
          <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{detalleDashboard === 'productos' ? '▲ cerrar' : '▼ ver detalle'}</div>
        </div>
        <div className="dashboard-card morado"><div className="card-icono">📈</div><div className="card-numero">${metricas.ventaPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</div><div className="card-titulo">Venta Promedio</div></div>
      </div>

      {/* Medios de pago */}
      {(() => {
        const medios = calcularMetricasMedios(ventasFiltradas);
        if (medios.lista.length === 0) return null;
        return (
          <div className="top-productos" style={{ marginTop: '16px' }}>
            <h3 style={{ color: '#000', marginBottom: '12px' }}>Medios de Pago — {periodoSeleccionado}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Medio</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Total</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {medios.lista.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', color: '#000', fontWeight: 'bold' }}>{m.metodo}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#000' }}>${m.monto.toLocaleString()}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#000' }}>{m.porcentaje}%</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #111', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                  <td style={{ padding: '8px', color: '#000' }}>TOTAL</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#000' }}>${medios.total.toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#000' }}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Detalle de ventas */}
      {detalleDashboard === 'ventas' && (
        <div className="top-productos" style={{ marginTop: '16px' }}>
          <h3 style={{ color: '#000', marginBottom: '12px' }}>🛒 Detalle de Ventas — {periodoSeleccionado}</h3>
          {ventasFiltradas.length === 0 ? (
            <div style={{ color: '#999', padding: '16px', textAlign: 'center' }}>Sin ventas en este período</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>{periodoSeleccionado === 'HOY' ? 'Hora' : 'Fecha y hora'}</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Productos</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Medio de pago</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Total</th>
                  {isAdmin && <th style={{ padding: '8px', textAlign: 'center', color: '#000' }}></th>}
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((v, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', color: '#000', whiteSpace: 'nowrap' }}>
                      {periodoSeleccionado !== 'HOY' && `${new Date(v.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} `}
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
                          <button onClick={() => setVentaAEliminar(v)} style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' }}>Eliminar</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detalle de productos */}
      {detalleDashboard === 'productos' && (() => {
        const productosMap = {};
        ventasFiltradas.forEach(v => {
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

      {/* Calendario + detalle del día */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}>
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
              const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
              const años = [];
              for (let y = new Date().getFullYear(); y >= 2024; y--) años.push(y);

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
                      <div key={dia} style={{ textAlign: 'center', fontWeight: 'bold', color: '#000', fontSize: '10px', padding: '2px' }}>{dia}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                    {Array(diaInicio).fill(null).map((_, i) => (
                      <div key={`vacio-${i}`} style={{ padding: '4px', textAlign: 'center' }}></div>
                    ))}
                    {Array.from({ length: diasDelMes }, (_, i) => i + 1).map(dia => {
                      const fechaString = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                      const tieneVentas = ventasDelDia.some(v => fechaLocal(v.fecha) === fechaString);
                      const estaSeleccionado = diaSeleccionado === fechaString;
                      return (
                        <button
                          key={dia}
                          onClick={() => setDiaSeleccionado(fechaString)}
                          style={{
                            padding: '4px 2px', border: estaSeleccionado ? '2px solid #ff00ff' : '1px solid #ccc',
                            backgroundColor: estaSeleccionado ? '#fff3e0' : tieneVentas ? '#e8f5e9' : '#fff',
                            borderRadius: '4px', cursor: 'pointer', textAlign: 'center', color: '#000',
                            fontSize: '11px', fontWeight: tieneVentas ? 'bold' : 'normal',
                            transition: 'all 0.2s', minWidth: 0
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

        {/* Detalle del día seleccionado */}
        <div className="top-productos">
          <h3 style={{ color: '#000' }}>
            {diaSeleccionado
              ? `📆 ${new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              : '📆 Selecciona un día'}
          </h3>
          <div style={{ marginTop: '12px', maxHeight: '500px', overflowY: 'auto' }}>
            {diaSeleccionado ? (() => {
              const ventasDelDiaSeleccionado = ventasDelDia.filter(v => fechaLocal(v.fecha) === diaSeleccionado);
              if (ventasDelDiaSeleccionado.length === 0) {
                return <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No hay ventas este día</div>;
              }
              const totalDia = ventasDelDiaSeleccionado.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0);
              const totalProductos = ventasDelDiaSeleccionado.reduce((sum, v) => sum + (v.items?.length || 0), 0);
              const mediosDia = calcularMetricasMedios(ventasDelDiaSeleccionado);
              const productosMap = {};
              ventasDelDiaSeleccionado.forEach(venta => {
                (venta.items || []).forEach(item => {
                  if (!productosMap[item.nombre]) productosMap[item.nombre] = { cantidad: 0, total: 0, precio: item.precio };
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
                  {mediosDia.lista.length > 0 && (
                    <>
                      <h4 style={{ color: '#000', marginTop: '10px', fontSize: '12px' }}>Medios de pago:</h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '6px', marginBottom: '10px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '6px', textAlign: 'left', color: '#000' }}>Medio</th>
                            <th style={{ padding: '6px', textAlign: 'right', color: '#000' }}>Total</th>
                            <th style={{ padding: '6px', textAlign: 'right', color: '#000' }}>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mediosDia.lista.map((m, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '6px', color: '#000', fontWeight: 'bold' }}>{m.metodo}</td>
                              <td style={{ padding: '6px', textAlign: 'right', color: '#000' }}>${m.monto.toLocaleString()}</td>
                              <td style={{ padding: '6px', textAlign: 'right', color: '#000' }}>{m.porcentaje}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
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

      {/* Reporte semanal */}
      <div className="top-productos" style={{ marginTop: '24px' }}>
        <h3 style={{ color: '#000' }}>📊 Reporte Semanal (Últimas 4 Semanas)</h3>
        <div style={{ marginTop: '12px' }}>
          {generarReporteSemanal(ventasDelDia).length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Semana</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Productos Vendidos</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Total Vendido</th>
                </tr>
              </thead>
              <tbody>
                {generarReporteSemanal(ventasDelDia).map((sem, idx) => (
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

      {/* Reporte mensual */}
      <div className="top-productos" style={{ marginTop: '24px' }}>
        <h3 style={{ color: '#000' }}>📈 Reporte Mensual (Últimos 12 Meses)</h3>
        <div style={{ marginTop: '12px' }}>
          {generarReporteMensual(ventasDelDia).length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Mes</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Productos Vendidos</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#000' }}>Total Vendido</th>
                </tr>
              </thead>
              <tbody>
                {generarReporteMensual(ventasDelDia).map((mes, idx) => (
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

      {/* Modal confirmación eliminar venta */}
      {ventaAEliminar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px 24px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', color: '#2d3748', textAlign: 'center' }}>Eliminar venta</h3>
            <p style={{ margin: '0 0 4px', color: '#4a5568', textAlign: 'center', fontSize: '14px' }}>
              ¿Estás seguro que querés eliminar esta venta?
            </p>
            <p style={{ margin: '0 0 20px', color: '#718096', textAlign: 'center', fontSize: '13px' }}>
              {new Date(ventaAEliminar.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {' — '}
              <strong>${(ventaAEliminar.total || 0).toLocaleString()}</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setVentaAEliminar(null)}
                style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
