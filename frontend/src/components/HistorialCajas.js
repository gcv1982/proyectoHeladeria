
import React from 'react';

export default function HistorialCajas({ historialCajas }) {
  const fmtFecha = (d) => d
    ? `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
    : '—';

  return (
    <div style={{ padding: '16px', maxWidth: '960px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>🏦 Historial de Cajas</h2>
      {historialCajas.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '32px' }}>No hay cajas registradas.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>#</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Apertura</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Cierre</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Usuario</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Inicio</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Ventas</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Retiros</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Cierre contado</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Diferencia</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historialCajas.map((caja, idx) => {
                const apertura = new Date(caja.fecha_apertura);
                const cierre = caja.fecha_cierre ? new Date(caja.fecha_cierre) : null;
                const diferencia = parseFloat(caja.diferencia || 0);
                const difColor = diferencia > 0 ? '#16a34a' : diferencia < 0 ? '#dc2626' : '#374151';
                const difPrefix = diferencia > 0 ? '+' : '';
                return (
                  <tr key={caja.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '9px 8px', color: '#6b7280' }}>{caja.id}</td>
                    <td style={{ padding: '9px 8px', color: '#111827' }}>{fmtFecha(apertura)}</td>
                    <td style={{ padding: '9px 8px', color: '#111827' }}>{fmtFecha(cierre)}</td>
                    <td style={{ padding: '9px 8px', color: '#111827' }}>{caja.usuario_nombre || '—'}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: '#111827' }}>${parseFloat(caja.monto_inicial || 0).toLocaleString()}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>${parseFloat(caja.total_ventas || 0).toLocaleString()}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: '#dc2626' }}>${parseFloat(caja.total_retiros || 0).toLocaleString()}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: '#111827' }}>
                      {caja.monto_cierre != null ? `$${parseFloat(caja.monto_cierre).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: '600', color: difColor }}>
                      {caja.diferencia != null ? `${difPrefix}$${Math.abs(diferencia).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                        background: caja.estado === 'abierta' ? '#dcfce7' : '#f1f5f9',
                        color: caja.estado === 'abierta' ? '#16a34a' : '#6b7280'
                      }}>
                        {caja.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                      </span>
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
