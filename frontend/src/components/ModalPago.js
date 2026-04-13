
import React from 'react';

export default function ModalPago({
  carrito, pagosSeleccionados,
  agregarMetodoPago, quitarMetodoPago, actualizarMontoPago,
  confirmarVenta, cancelarVenta,
}) {
  const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalIngresado = pagosSeleccionados.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="modal-overlay" onClick={cancelarVenta}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>💳 Método de Pago</h2>
        <div className="modal-total">
          <span>Total a cobrar:</span>
          <span className="modal-total-precio">${totalVenta.toLocaleString()}</span>
        </div>

        {pagosSeleccionados.length > 0 && (
          <div className="pagos-seleccionados">
            {pagosSeleccionados.map((pago, index) => (
              <div key={index} className="pago-item">
                <span className="pago-metodo">{pago.metodo}</span>
                <input
                  name={`pago-monto-${index}`}
                  type="number"
                  className="pago-monto-input"
                  value={pago.monto}
                  onChange={(e) => actualizarMontoPago(index, e.target.value)}
                  placeholder="Monto"
                />
                <button className="pago-quitar" onClick={() => quitarMetodoPago(index)}>✕</button>
              </div>
            ))}

            <div className="pago-total-parcial">
              <span>Total ingresado:</span>
              <span className={totalIngresado === totalVenta ? 'total-correcto' : 'total-incorrecto'}>
                ${totalIngresado.toLocaleString()}
              </span>
            </div>

            <div className="metodos-resumen">
              <div className="label">Medios usados:</div>
              <div className="metodos-list">
                {pagosSeleccionados.map((p, i) => (
                  <div key={i} className="metodo-line">{p.metodo} — ${p.monto.toLocaleString()}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {pagosSeleccionados.length < 2 && (
          <div className="modal-botones">
            <button className="metodo-pago-btn efectivo" onClick={() => agregarMetodoPago('EFECTIVO')}>EFECTIVO</button>
            <button className="metodo-pago-btn debito" onClick={() => agregarMetodoPago('DÉBITO')}>DÉBITO</button>
            <button className="metodo-pago-btn transferencia" onClick={() => agregarMetodoPago('TRANSFERENCIA')}>TRANSFERENCIA</button>
            <button className="metodo-pago-btn qr" onClick={() => agregarMetodoPago('QR')}>QR</button>
          </div>
        )}

        <div className="modal-acciones">
          {pagosSeleccionados.length > 0 && (
            <button className="modal-confirmar" onClick={confirmarVenta}>✓ CONFIRMAR VENTA</button>
          )}
          <button className="modal-cancelar" onClick={cancelarVenta}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
