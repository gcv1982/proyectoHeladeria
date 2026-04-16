
import React from 'react';
import DenomGrid from './DenomGrid';
import { calcularResumenCaja, calcularMetricasMedios, fechaLocal } from '../utils/reportes';

export default function CajaView({
  cajaAbierta, inicioCaja, isAdmin,
  denomInicioRef, denomCierreRef, cierreKey, setCierreTotalContado, cierreTotalContado,
  nuevoRetiroMonto, setNuevoRetiroMonto, nuevoRetiroDesc, setNuevoRetiroDesc,
  ingresoMonto, setIngresoMonto, ingresoDesc, setIngresoDesc, ingresoMetodo, setIngresoMetodo,
  nuevoGastoMonto, setNuevoGastoMonto, nuevoGastoDesc, setNuevoGastoDesc,
  retiros, gastos, ingresos, retiroEditandoIdx,
  editandoMonto, setEditandoMonto, editandoDesc, setEditandoDesc,
  ventasDelDia,
  agregarRetiro, eliminarRetiro, iniciarEdicionRetiro, guardarEdicionRetiro, cancelarEdicionRetiro,
  guardarIngresoExtra, agregarGasto, eliminarGasto,
  exportarRetirosCSV, confirmarInicioCaja, confirmarCierreCaja, setMostrarCaja,
}) {
  const resumen = calcularResumenCaja(inicioCaja, ventasDelDia, retiros, gastos, cierreTotalContado, ingresos);

  return (
    <div className="caja-container">
      {!cajaAbierta ? (
        <div className="inicio-caja">
          <h2>💰 Inicio de Caja</h2>
          <p className="fecha-caja">📅 {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <DenomGrid ref={denomInicioRef} prefix="inicio" gridClass="denominaciones-grid" totalLabel="Total Inicio de Caja" />
          <div className="botones-caja">
            <button className="btn-inicio-caja" onClick={confirmarInicioCaja}>✓ Confirmar e Iniciar Caja</button>
            <button className="btn-cancelar-caja" onClick={() => setMostrarCaja(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="cierre-caja">
          <h2>💰 Cierre de Caja</h2>
          <p className="fecha-caja">📅 {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="cierre-layout">
            <div className="cierre-conteo">
              <h3>💵 Contar Efectivo en Caja</h3>
              <DenomGrid
                ref={denomCierreRef}
                key={cierreKey}
                prefix="cierre"
                gridClass="denominaciones-grid-cierre"
                totalLabel="Total Contado"
                onTotalChange={setCierreTotalContado}
                storageKey="cierre-denominaciones"
              />
            </div>

            <div className="cierre-resumen">
              <h3>📊 Resumen del Día</h3>
              <div className="resumen-item resumen-destacado"><span>Inicio de Caja:</span><span className="monto">${resumen.montoInicial.toLocaleString()}</span></div>
              <div className="resumen-item resumen-destacado"><span>Ventas del Día:</span><span className="monto positivo">${resumen.totalVentas.toLocaleString()}</span></div>

              {(() => {
                const hoy = new Date();
                const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
                const fechaDesdeApertura = inicioCaja?.fecha ? fechaLocal(inicioCaja.fecha) : fechaHoy;
                const ventasHoy = ventasDelDia.filter(v => fechaLocal(v.fecha) >= fechaDesdeApertura);
                const medios = calcularMetricasMedios(ventasHoy);
                return medios.lista.length > 0 ? (
                  <div className="resumen-medios">
                    <h4>Medios de Pago</h4>
                    {medios.lista.map((m, idx) => (
                      <div key={idx} className="resumen-item">
                        <span>{m.metodo}</span>
                        <span className="monto">${m.monto.toLocaleString()}<span className="porcentaje"> {m.porcentaje}%</span></span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Ingresos extra — formulario */}
              <div className="retirar-form" style={{ marginTop: 10 }}>
                <input name="ingreso-monto" type="number" min="0" value={ingresoMonto} onChange={(e) => setIngresoMonto(e.target.value)} placeholder="Monto ingreso" />
                <input name="ingreso-desc" type="text" value={ingresoDesc} onChange={(e) => setIngresoDesc(e.target.value)} placeholder="Descripción (opcional)" />
                <select name="ingreso-metodo" className="select-metodo" value={ingresoMetodo} onChange={(e) => setIngresoMetodo(e.target.value)}>
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                  <option value="DÉBITO">DÉBITO</option>
                </select>
                <button className="btn-retiro" onClick={guardarIngresoExtra}>Registrar Ingreso</button>
              </div>

              {/* Lista de ingresos extra */}
              {ingresos.length > 0 && (
                <div className="lista-retiros">
                  <div className="resumen-item"><span style={{ fontWeight: 600 }}>Ingresos registrados:</span></div>
                  {ingresos.map((ing, idx) => (
                    <div key={idx} className="resumen-item retiro-item">
                      <span>{ing.descripcion} <small className="retiro-fecha">({new Date(ing.fecha).toLocaleTimeString()})</small> <small style={{ color: '#718096' }}>{ing.metodo}</small></span>
                      <span className="monto positivo">${ing.monto.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="resumen-item"><span>Total Ingresos:</span><span className="monto positivo">${resumen.ingresos.toLocaleString()}</span></div>
                </div>
              )}

              {/* Retiros — formulario solo para no admin, lista para todos */}
              {!isAdmin && (
                <div className="retirar-form" style={{ marginTop: 10 }}>
                  <input name="retiro-monto" type="number" min="1" value={nuevoRetiroMonto} onChange={(e) => setNuevoRetiroMonto(e.target.value)} placeholder="Monto retiro" />
                  <input name="retiro-desc" type="text" value={nuevoRetiroDesc} onChange={(e) => setNuevoRetiroDesc(e.target.value)} placeholder="Concepto (opcional)" />
                  <button className="btn-retiro" onClick={agregarRetiro}>Registrar Retiro</button>
                </div>
              )}
              {!isAdmin ? (
                <div className="lista-retiros">
                  {retiros.length > 0 ? (
                    <>
                      {retiros.map((r, idx) => (
                        <div key={idx} className="resumen-item retiro-item">
                          <span>{r.descripcion} <small className="retiro-fecha">({new Date(r.fecha).toLocaleTimeString()})</small></span>
                          <span className="monto negativo">${r.monto.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="resumen-item"><span>Total Retiros:</span><span className="monto negativo">-${resumen.retiros.toLocaleString()}</span></div>
                    </>
                  ) : (
                    <div className="resumen-item"><span>Retiros:</span><span className="monto negativo">$0</span></div>
                  )}
                </div>
              ) : (
                <div className="resumen-item"><span>Retiros:</span><span className="monto negativo">-${resumen.retiros.toLocaleString()}</span></div>
              )}

              {/* Gastos */}
              <div className="lista-gastos">
                <h4 style={{ margin: '0 0 8px 0' }}>💸 Gastos del Día</h4>
                <div className="retirar-form" style={{ marginBottom: '8px' }}>
                  <input name="gasto-monto" type="number" min="0" value={nuevoGastoMonto} onChange={(e) => setNuevoGastoMonto(e.target.value)} placeholder="Monto gasto" />
                  <input name="gasto-desc" type="text" value={nuevoGastoDesc} onChange={(e) => setNuevoGastoDesc(e.target.value)} placeholder="Descripción (opcional)" />
                  <button className="btn-retiro" onClick={agregarGasto}>Agregar Gasto</button>
                </div>
                {gastos.length > 0 ? (
                  <>
                    {gastos.map((g, idx) => (
                      <div key={idx} className="resumen-item retiro-item">
                        <span>{g.descripcion} <small className="retiro-fecha">({new Date(g.fecha).toLocaleTimeString()})</small></span>
                        <span className="monto negativo">${g.monto.toLocaleString()} <button className="btn-eliminar-retiro" onClick={() => eliminarGasto(idx)}>✕</button></span>
                      </div>
                    ))}
                    <div className="resumen-item"><span>Total Gastos:</span><span className="monto negativo">${resumen.gastos.toLocaleString()}</span></div>
                  </>
                ) : (
                  <div className="resumen-item"><span>Gastos:</span><span className="monto negativo">$0</span></div>
                )}
              </div>

              <div className="resumen-divider"></div>
              <div className="resumen-item destacado"><span>Total Esperado:</span><span className="monto">${resumen.totalEsperado.toLocaleString()}</span></div>
              <div className="resumen-item destacado"><span>Plata en Caja:</span><span className="monto">${resumen.totalReal.toLocaleString()}</span></div>
              <div className="resumen-divider"></div>
              <div className={`resumen-item final ${resumen.diferencia === 0 ? 'correcto' : resumen.diferencia > 0 ? 'sobrante' : 'faltante'}`}>
                <span>Diferencia:</span><span className="monto">${resumen.diferencia.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="botones-caja">
            <button className="btn-confirmar-caja" onClick={confirmarCierreCaja}>✓ Confirmar Cierre de Caja</button>
            <button className="btn-cancelar-caja" onClick={() => setMostrarCaja(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
