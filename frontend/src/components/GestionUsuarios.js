
import React from 'react';

export default function GestionUsuarios({
  usuarios, nuevoUsuario, setNuevoUsuario,
  usuarioEditando, setUsuarioEditando,
  nuevaPasswordEdit, setNuevaPasswordEdit,
  crearUsuario, guardarEdicionUsuario, eliminarUsuario,
  generarPasswordAleatoria, currentUserId,
}) {
  return (
    <div style={{ padding: '16px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>👥 Gestión de Usuarios</h2>

      {/* Formulario nuevo usuario */}
      <div style={{ background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Crear nuevo usuario</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <input value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario(u => ({ ...u, nombre: e.target.value }))} placeholder="Nombre completo" style={{ flex: 2, padding: '7px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', minWidth: '130px' }} />
          <input value={nuevoUsuario.email} onChange={e => setNuevoUsuario(u => ({ ...u, email: e.target.value }))} placeholder="Nombre de usuario (para login)" style={{ flex: 2, padding: '7px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', minWidth: '150px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input value={nuevoUsuario.password} onChange={e => setNuevoUsuario(u => ({ ...u, password: e.target.value }))} placeholder="Contraseña" style={{ flex: 2, padding: '7px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', minWidth: '130px' }} />
          <button onClick={() => setNuevoUsuario(u => ({ ...u, password: generarPasswordAleatoria() }))} style={{ padding: '7px 10px', background: '#e2e8f0', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>🎲 Generar</button>
          <select value={nuevoUsuario.rol} onChange={e => setNuevoUsuario(u => ({ ...u, rol: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={crearUsuario} style={{ padding: '7px 14px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Crear</button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px 8px', textAlign: 'left', color: '#374151' }}>Nombre</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', color: '#374151' }}>Usuario (login)</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', color: '#374151' }}>Rol</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', color: '#374151' }}>Contraseña</th>
            <th style={{ padding: '10px 8px', textAlign: 'center', color: '#374151' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, idx) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
              {usuarioEditando?.id === u.id ? (
                <>
                  <td style={{ padding: '6px 8px' }}><input value={usuarioEditando.nombre} onChange={e => setUsuarioEditando(x => ({ ...x, nombre: e.target.value }))} style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }} /></td>
                  <td style={{ padding: '6px 8px' }}><input value={usuarioEditando.email} onChange={e => setUsuarioEditando(x => ({ ...x, email: e.target.value }))} style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }} /></td>
                  <td style={{ padding: '6px 8px' }}>
                    <select value={usuarioEditando.rol} onChange={e => setUsuarioEditando(x => ({ ...x, rol: e.target.value }))} style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                      <option value="vendedor">Vendedor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input value={nuevaPasswordEdit} onChange={e => setNuevaPasswordEdit(e.target.value)} placeholder="Nueva contraseña (opcional)" style={{ flex: 1, padding: '5px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} />
                      <button onClick={() => setNuevaPasswordEdit(generarPasswordAleatoria())} style={{ padding: '5px 8px', background: '#e2e8f0', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>🎲</button>
                    </div>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <button onClick={guardarEdicionUsuario} style={{ background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', marginRight: '4px' }}>✓ Guardar</button>
                    <button onClick={() => { setUsuarioEditando(null); setNuevaPasswordEdit(''); }} style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '9px 8px', fontWeight: '600', color: '#111' }}>{u.nombre}</td>
                  <td style={{ padding: '9px 8px', color: '#374151' }}>{u.email}</td>
                  <td style={{ padding: '9px 8px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: u.rol === 'admin' ? '#fef3c7' : '#eff6ff', color: u.rol === 'admin' ? '#92400e' : '#1d4ed8' }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: '9px 8px', color: '#9ca3af', fontSize: '12px' }}>••••••••</td>
                  <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                    <button onClick={() => { setUsuarioEditando(u); setNuevaPasswordEdit(''); }} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px', marginRight: '4px' }}>Editar</button>
                    {u.id !== currentUserId && <button onClick={() => eliminarUsuario(u.id, u.nombre)} style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px' }}>Eliminar</button>}
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
