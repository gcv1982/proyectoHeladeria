
import React from 'react';

export default function ModalEditarVenta({
  ventaEditando, setVentaEditando,
  productos, productoAgregarEdit, setProductoAgregarEdit,
  guardarEdicionVenta,
}) {
  const totItems = ventaEditando.items.reduce((s, it) => s + it.precio * it.cantidad, 0);
  const totPagos = ventaEditando.pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const ok = Math.abs(totItems - totPagos) <= 0.01;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', color: '#2d3748' }}>Editar venta</h3>

        {/* Items */}
        <h4 style={{ margin: '0 0 8px', color: '#4a5568' }}>Productos</h4>
        {ventaEditando.items.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', background: '#f8f9fa', padding: '6px 10px', borderRadius: '6px' }}>
            <span style={{ flex: 1, fontSize: '13px' }}>{it.nombre}</span>
            <span style={{ fontSize: '12px', color: '#718096' }}>${it.precio.toLocaleString()} c/u</span>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={it.cantidad}
              onChange={e => {
                const c = Math.max(1, parseInt(e.target.value) || 1);
                setVentaEditando(prev => { const items = [...prev.items]; items[idx] = { ...items[idx], cantidad: c }; return { ...prev, items }; });
              }}
              style={{ width: '48px', textAlign: 'center', border: '1px solid #cbd5e0', borderRadius: '4px', padding: '3px' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '70px', textAlign: 'right' }}>${(it.precio * it.cantidad).toLocaleString()}</span>
            <button onClick={() => setVentaEditando(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))}
              style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', fontSize: '13px' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '16px' }}>
          <select value={productoAgregarEdit} onChange={e => setProductoAgregarEdit(e.target.value)}
            style={{ flex: 1, padding: '6px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
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
          }} style={{ background: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>+ Agregar</button>
        </div>

        {/* Pagos */}
        <h4 style={{ margin: '0 0 8px', color: '#4a5568' }}>Medios de pago</h4>
        {ventaEditando.pagos.map((p, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', background: '#f8f9fa', padding: '6px 10px', borderRadius: '6px' }}>
            <select value={p.metodo} onChange={e => setVentaEditando(prev => { const pagos = [...prev.pagos]; pagos[idx] = { ...pagos[idx], metodo: e.target.value }; return { ...prev, pagos }; })}
              style={{ flex: 1, padding: '4px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '13px' }}>
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              <option value="DÉBITO">DÉBITO</option>
            </select>
            <input type="text" inputMode="numeric" pattern="[0-9]*"
              value={p.monto}
              onChange={e => setVentaEditando(prev => { const pagos = [...prev.pagos]; pagos[idx] = { ...pagos[idx], monto: parseInt(e.target.value) || 0 }; return { ...prev, pagos }; })}
              style={{ width: '90px', textAlign: 'right', border: '1px solid #cbd5e0', borderRadius: '4px', padding: '3px 6px', fontSize: '13px' }}
            />
            <button onClick={() => setVentaEditando(prev => ({ ...prev, pagos: prev.pagos.filter((_, i) => i !== idx) }))}
              style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', fontSize: '13px' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setVentaEditando(prev => ({ ...prev, pagos: [...prev.pagos, { metodo: 'EFECTIVO', monto: 0 }] }))}
          style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '13px', marginBottom: '16px' }}>+ Agregar pago</button>

        {/* Totales */}
        <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
            <span>Total productos:</span><span style={{ fontWeight: 700 }}>${totItems.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
            <span>Total pagos:</span><span style={{ fontWeight: 700, color: ok ? '#38a169' : '#e53e3e' }}>${totPagos.toLocaleString()}</span>
          </div>
          {!ok && <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>Los totales no coinciden</div>}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setVentaEditando(null)} style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          <button onClick={guardarEdicionVenta} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}
