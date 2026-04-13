
import React from 'react';

export default function GestionProductos({
  todosProductos, nuevoProducto, setNuevoProducto,
  productoEditando, setProductoEditando, categorias,
  guardarProducto, guardarEdicionProducto, toggleActivoProducto,
}) {
  return (
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
  );
}
