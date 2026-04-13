
import React from 'react';

export default function VentaConfirmada({ ventaConfirmada, cerrarResumenVenta, printTicket }) {
  return (
    <div className="modal-overlay" onClick={cerrarResumenVenta}>
      <div className="modal-content resumen-venta" onClick={(e) => e.stopPropagation()}>
        <h2>✅ ¡Venta Confirmada!</h2>
        <div className="resumen-venta-contenido">
          <div className="resumen-venta-item">
            <span>Total:</span>
            <span className="resumen-venta-total">${ventaConfirmada.total.toLocaleString()}</span>
          </div>
          {ventaConfirmada.pagos && ventaConfirmada.pagos.length > 0 && (
            <div className="resumen-venta-pagos">
              <h4>Medios de Pago:</h4>
              {ventaConfirmada.pagos.map((p, idx) => (
                <div key={idx} className="resumen-venta-pago">
                  <span>{p.metodo}</span>
                  <span>${p.monto.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          {ventaConfirmada.items && ventaConfirmada.items.length > 0 && (
            <div className="resumen-venta-items">
              <h4>Productos:</h4>
              {ventaConfirmada.items.map((it, idx) => (
                <div key={idx} className="resumen-venta-item-detalle">
                  <span>{it.cantidad}x {it.nombre}</span>
                  <span>${(it.cantidad * it.precio).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-acciones-resumen">
          <button className="modal-imprimir" onClick={() => printTicket(ventaConfirmada)}>🖨️ IMPRIMIR TICKET</button>
          <button className="modal-confirmar" onClick={cerrarResumenVenta}>✓ CONTINUAR</button>
        </div>
      </div>
    </div>
  );
}
