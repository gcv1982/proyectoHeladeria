
import React from 'react';

export default function MiTurno({ turnoActivo, ventasDelDia, user }) {
  const fmtHora = (d) => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  const fmtFecha = (d) => `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;

  return (
    <div style={{ padding: '16px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>👤 Mi Turno</h2>
      {!turnoActivo ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No tenés un turno activo.</p>
      ) : (() => {
        const inicio = new Date(turnoActivo.fecha_inicio);
        const ventasTurno = ventasDelDia.filter(v =>
          v.estado !== 'cancelada' && new Date(v.fecha) >= inicio
        );
        const totalTurno = ventasTurno.reduce((s, v) => s + parseFloat(v.total || 0), 0);
        const porMetodo = {};
        ventasTurno.forEach(v => {
          (v.pagos || []).forEach(p => {
            porMetodo[p.metodo] = (porMetodo[p.metodo] || 0) + parseFloat(p.monto || 0);
          });
        });

        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '4px' }}>INICIO DE TURNO</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>{fmtHora(inicio)}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{fmtFecha(inicio)}</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginBottom: '4px' }}>VENTAS</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111' }}>{ventasTurno.length}</div>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#ca8a04', fontWeight: '600', marginBottom: '4px' }}>TOTAL RECAUDADO</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#111' }}>${totalTurno.toLocaleString()}</div>
              </div>
            </div>

            {Object.keys(porMetodo).length > 0 && (
              <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Por medio de pago</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {Object.entries(porMetodo).map(([metodo, monto]) => (
                    <div key={metodo} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', fontSize: '13px' }}>
                      <span style={{ color: '#6b7280' }}>{metodo}:</span>
                      <span style={{ fontWeight: '700', color: '#111', marginLeft: '6px' }}>${monto.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ventasTurno.length > 0 && (
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
                    {ventasTurno.map((v, idx) => {
                      const fecha = new Date(v.fecha);
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '8px', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtHora(fecha)}</td>
                          <td style={{ padding: '8px', color: '#111' }}>{(v.items || []).map(it => `${it.cantidad}x ${it.nombre}`).join(', ')}</td>
                          <td style={{ padding: '8px', color: '#6b7280' }}>{(v.pagos || []).map(p => p.metodo).join(', ')}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#111' }}>${parseFloat(v.total).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
