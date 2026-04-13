
// ── Ticket de venta ───────────────────────────────────────────────────────────

export const generarHTMLTicket = (venta) => {
  const nombreTienda = 'Grido Laspiur';
  const fecha = new Date(venta.fecha).toLocaleString('es-AR');
  const itemsHtml = (venta.items || []).map(it => `
    <tr>
      <td style="padding:4px 8px">${it.cantidad} x ${it.nombre}</td>
      <td style="padding:4px 8px; text-align:right">$${(it.precio * it.cantidad).toLocaleString()}</td>
    </tr>
  `).join('');
  const pagosHtml = (venta.pagos || []).map(p =>
    `<div style="display:flex;justify-content:space-between;margin-top:6px"><div>${p.metodo}</div><div>$${p.monto.toLocaleString()}</div></div>`
  ).join('');
  const totalHtml = `<div style="display:flex;justify-content:space-between;font-weight:700;margin-top:8px"><div>TOTAL</div><div>$${venta.total.toLocaleString()}</div></div>`;
  const descripcion = venta.descripcion ? `<div style="margin-top:6px">${venta.descripcion}</div>` : '';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Ticket</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 10px; }
          .center { text-align: center; }
          .items { width: 100%; border-collapse: collapse; margin-top: 8px; }
          @media print { body { margin:0 } }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin:6px 0">${nombreTienda}</h2>
          <div>${fecha}</div>
        </div>
        <hr />
        <table class="items">${itemsHtml}</table>
        ${totalHtml}
        <div style="margin-top:8px">${pagosHtml}</div>
        ${descripcion}
        <hr />
        <div class="center">Gracias por su compra</div>
      </body>
    </html>
  `;
};

export const printTicket = (venta) => {
  const html = generarHTMLTicket(venta);
  const w = window.open('', '_blank', 'width=400,height=600');
  if (!w) { alert('No se pudo abrir la ventana de impresión. Revisa el bloqueador de ventanas emergentes.'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.print(); }, 300);
};

// ── Reporte de cierre de caja ─────────────────────────────────────────────────

export const imprimirReporteCierre = (resumen, ventasHoy, retirosHoy, inicioCaja) => {
  const ahora = new Date();
  const fmt = (d) =>
    `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ` +
    `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;

  const porMetodo = {};
  ventasHoy.forEach(v => {
    (v.pagos || []).forEach(p => {
      porMetodo[p.metodo] = (porMetodo[p.metodo] || 0) + parseFloat(p.monto || 0);
    });
  });
  const totalGeneral = Object.values(porMetodo).reduce((s, v) => s + v, 0);

  const difColor = resumen.diferencia >= 0 ? '#16a34a' : '#dc2626';
  const difText = resumen.diferencia >= 0
    ? `+$${resumen.diferencia.toLocaleString()}`
    : `-$${Math.abs(resumen.diferencia).toLocaleString()}`;

  const fila = (label, valor, bold = false, color = '') =>
    `<tr style="${bold ? 'font-weight:bold;border-top:1px solid #111;' : ''}">
      <td style="padding:5px 4px;">${label}</td>
      <td style="text-align:right;padding:5px 4px;${color ? `color:${color};font-weight:bold;` : ''}">$${valor}</td>
    </tr>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Cierre de Caja</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 13px; color: #111; padding: 16px; max-width: 320px; margin: 0 auto; }
    h1 { font-size: 16px; text-align: center; margin-bottom: 2px; }
    .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 12px; }
    .linea { border-top: 1px dashed #999; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { font-size: 13px; }
    .titulo-sec { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin: 10px 0 4px 0; }
    @media print { body { padding: 4px; } }
  </style></head><body>
  <h1>GRIDO LASPIUR</h1>
  <p class="sub">CIERRE DE CAJA</p>
  <p class="sub">${fmt(ahora)}</p>
  ${inicioCaja ? `<p class="sub">Apertura: ${fmt(new Date(inicioCaja.fecha))}</p>` : ''}
  <div class="linea"></div>
  <p class="titulo-sec">Ventas por medio de pago</p>
  <table>
    ${Object.entries(porMetodo).map(([m, v]) => fila(m, v.toLocaleString())).join('')}
    ${fila('TOTAL VENTAS', totalGeneral.toLocaleString(), true)}
  </table>
  <div class="linea"></div>
  <p class="titulo-sec">Caja efectivo</p>
  <table>
    ${fila('Monto inicial', resumen.montoInicial.toLocaleString())}
    ${fila('Ventas efectivo', (porMetodo['EFECTIVO'] || 0).toLocaleString())}
    ${resumen.retiros > 0 ? fila('Retiros', resumen.retiros.toLocaleString()) : ''}
    ${fila('Efectivo esperado', resumen.totalEsperado.toLocaleString(), true)}
    ${fila('Efectivo contado', resumen.totalReal.toLocaleString())}
    ${fila('Diferencia', difText.replace('$',''), true, difColor)}
  </table>
  ${retirosHoy.length > 0 ? `
  <div class="linea"></div>
  <p class="titulo-sec">Retiros (${retirosHoy.length})</p>
  <table>
    ${retirosHoy.map(r => fila(r.descripcion || 'Retiro', parseFloat(r.monto).toLocaleString())).join('')}
  </table>` : ''}
  <div class="linea"></div>
  <p class="sub">Sistema Grido Laspiur</p>
  <script>window.onload = () => window.print();</script>
  </body></html>`;

  const ventana = window.open('', '_blank', 'width=380,height=600');
  ventana.document.write(html);
  ventana.document.close();
};
