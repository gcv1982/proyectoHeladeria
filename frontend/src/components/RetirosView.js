
import React from 'react';

export default function RetirosView({
  retiros, nuevoRetiroMonto, setNuevoRetiroMonto, nuevoRetiroDesc, setNuevoRetiroDesc,
  retiroEditandoIdx, editandoMonto, setEditandoMonto, editandoDesc, setEditandoDesc,
  isAdmin, agregarRetiro, eliminarRetiro, iniciarEdicionRetiro,
  guardarEdicionRetiro, cancelarEdicionRetiro, exportarRetirosCSV,
}) {
  const sumarRetiros = () => retiros.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);

  return (
    <div className="retiros-container">
      <h2>📋 Registro de Retiros</h2>
      <div className="retiros-content">
        <div className="retiros-formulario">
          <h3>Registrar Nuevo Retiro</h3>
          {isAdmin ? (
            <div className="retirar-form">
              <input name="retiro-monto" type="number" min="1" value={nuevoRetiroMonto} onChange={(e) => setNuevoRetiroMonto(e.target.value)} placeholder="Monto del retiro" />
              <input name="retiro-desc" type="text" value={nuevoRetiroDesc} onChange={(e) => setNuevoRetiroDesc(e.target.value)} placeholder="Concepto o descripción (opcional)" />
              <button className="btn-retiro" onClick={agregarRetiro}>✓ Registrar Retiro</button>
              <button className="export-btn" onClick={exportarRetirosCSV} disabled={retiros.length === 0}>📥 Exportar a CSV</button>
            </div>
          ) : (
            <div className="sin-permiso">⚠️ No tenés permisos para registrar retiros</div>
          )}
        </div>

        <div className="retiros-lista">
          <h3>Historial de Retiros</h3>
          {retiros.length > 0 ? (
            <div className="lista-retiros-completa">
              {retiros.map((r, idx) => (
                <div key={idx} className={`retiro-item-full ${retiroEditandoIdx === idx ? 'editando' : ''}`}>
                  {retiroEditandoIdx === idx ? (
                    <div className="retiro-edicion-form">
                      <input name="edit-desc" type="text" value={editandoDesc} onChange={(e) => setEditandoDesc(e.target.value)} placeholder="Descripción" />
                      <input name="edit-monto" type="number" value={editandoMonto} onChange={(e) => setEditandoMonto(e.target.value)} placeholder="Monto" />
                      <button className="btn-guardar" onClick={() => guardarEdicionRetiro(idx)}>✓ Guardar</button>
                      <button className="btn-cancelar" onClick={cancelarEdicionRetiro}>⏮ Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <div className="retiro-info">
                        <span className="retiro-desc">{r.descripcion}</span>
                        <span className="retiro-fecha">{new Date(r.fecha).toLocaleString('es-AR')}</span>
                        {r.usuario && <span className="retiro-usuario">Por: {r.usuario}</span>}
                      </div>
                      <div className="retiro-monto-container">
                        <span className="retiro-monto">${r.monto.toLocaleString()}</span>
                        {isAdmin && <>
                          <button className="btn-editar-retiro" onClick={() => iniciarEdicionRetiro(idx)}>✏️</button>
                          <button className="btn-eliminar-retiro" onClick={() => eliminarRetiro(idx)}>✕</button>
                        </>}
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="retiro-total">
                <span>Total Retiros:</span>
                <span className="total-monto">${sumarRetiros().toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="retiros-vacio">No hay retiros registrados</div>
          )}
        </div>
      </div>
    </div>
  );
}
