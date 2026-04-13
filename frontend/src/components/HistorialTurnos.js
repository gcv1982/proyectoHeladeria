
import React from 'react';

export default function HistorialTurnos({ historialTurnos, turnoDetalle, setTurnoDetalle, cargarDetalleTurno }) {
  const fmt = (d) => d
    ? `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
    : '—';
  const fmtHora = (d) => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;

  return (
    <div style={{ padding: '16px', maxWidth: '960px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>👥 Historial de Turnos</h2>

      {turnoDetalle ? (
        <>
          <button onClick={() => setTurnoDetalle(null)} style={{ marginBottom: '16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>← Volver</button>
          <h3 style={{ fontSize: '15px', marginBottom: '12px', color: '#374151' }}>
            Turno de {turnoDetalle.turno?.usuario_nombre || '—'} — {turnoDetalle.ventas?.length || 0} ventas
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#374151' }}>Hora</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#374151' }}>Productos</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#374151' }}>Pago</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#374151' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(turnoDetalle.ventas || []).map((v, idx) => {
                  const fecha = new Date(v.fecha);
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '8px', color: '#6b7280' }}>{fmtHora(fecha)}</td>
                      <td style={{ padding: '8px', color: '#111' }}>{(v.items || []).map(it => `${it.cantidad}x ${it.nombre}`).join(', ')}</td>
                      <td style={{ padding: '8px', color: '#6b7280' }}>{(v.pagos || []).map(p => p.metodo).join(', ')}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#111' }}>${parseFloat(v.total).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
                  <td colSpan={3} style={{ padding: '8px', fontWeight: '700', color: '#374151' }}>TOTAL</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: '#111' }}>
                    ${(turnoDetalle.ventas || []).reduce((s, v) => s + parseFloat(v.total || 0), 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      ) : historialTurnos.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No hay turnos registrados.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#374151' }}>Vendedor</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#374151' }}>Inicio</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#374151' }}>Fin</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>Ventas</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>Total</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#374151' }}>Estado</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#374151' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {historialTurnos.map((t, idx) => {
                const inicio = new Date(t.fecha_inicio);
                const fin = t.fecha_fin ? new Date(t.fecha_fin) : null;
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '9px 8px', fontWeight: '600', color: '#111' }}>{t.usuario_nombre || '—'}</td>
                    <td style={{ padding: '9px 8px', color: '#374151' }}>{fmt(inicio)}</td>
                    <td style={{ padding: '9px 8px', color: '#374151' }}>{fmt(fin)}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: '#374151' }}>{t.cantidad_ventas}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>${parseFloat(t.total_ventas || 0).toLocaleString()}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: t.estado === 'abierto' ? '#dcfce7' : '#f1f5f9', color: t.estado === 'abierto' ? '#16a34a' : '#6b7280' }}>
                        {t.estado === 'abierto' ? 'En curso' : 'Cerrado'}
                      </span>
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                      <button onClick={() => cargarDetalleTurno(t.id)} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px' }}>Ver</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
