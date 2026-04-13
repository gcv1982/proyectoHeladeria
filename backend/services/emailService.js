const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const crearTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const formatearPesos = (monto) =>
  `$${Number(monto || 0).toLocaleString('es-AR')}`;

const enviarResumenCierre = async ({ fecha, resumen, ventasPorMedio, retiros, gastos }) => {
  const transporter = crearTransporter();

  const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const filasMedios = ventasPorMedio.length > 0
    ? ventasPorMedio.map(m => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${m.metodo}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatearPesos(m.monto)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${m.porcentaje}%</td>
        </tr>`).join('')
    : '<tr><td colspan="3" style="padding:8px 12px;color:#999;">Sin ventas</td></tr>';

  const filasRetiros = retiros.length > 0
    ? retiros.map(r => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${r.descripcion || 'Retiro'}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;color:#e53e3e;">${formatearPesos(r.monto)}</td>
        </tr>`).join('')
    : '<tr><td colspan="2" style="padding:6px 12px;color:#999;">Sin retiros</td></tr>';

  const filasGastos = gastos.length > 0
    ? gastos.map(g => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${g.descripcion || 'Gasto'}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;color:#e53e3e;">${formatearPesos(g.monto)}</td>
        </tr>`).join('')
    : '<tr><td colspan="2" style="padding:6px 12px;color:#999;">Sin gastos</td></tr>';

  const diferencia = resumen.diferencia || 0;
  const diferenciaColor = diferencia === 0 ? '#38a169' : diferencia > 0 ? '#3182ce' : '#e53e3e';
  const diferenciaTexto = diferencia === 0 ? 'Exacto ✓' : diferencia > 0 ? `Sobrante ${formatearPesos(diferencia)}` : `Faltante ${formatearPesos(Math.abs(diferencia))}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:28px 32px;">
      <h1 style="margin:0;color:white;font-size:22px;">🍦 Resumen de Cierre de Caja</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;text-transform:capitalize;">${fechaFormateada}</p>
    </div>

    <div style="padding:24px 32px;">

      <!-- Totales principales -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8f9ff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px 16px;font-size:14px;color:#4a5568;">Inicio de Caja</td>
          <td style="padding:12px 16px;text-align:right;font-weight:700;font-size:14px;color:#2d3748;">${formatearPesos(resumen.montoInicial)}</td>
        </tr>
        <tr style="background:#fff;">
          <td style="padding:12px 16px;font-size:14px;color:#4a5568;">Total Ventas</td>
          <td style="padding:12px 16px;text-align:right;font-weight:700;font-size:14px;color:#38a169;">${formatearPesos(resumen.totalVentas)}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:14px;color:#4a5568;">Total Retiros</td>
          <td style="padding:12px 16px;text-align:right;font-weight:700;font-size:14px;color:#e53e3e;">-${formatearPesos(resumen.retiros)}</td>
        </tr>
        <tr style="background:#fff;">
          <td style="padding:12px 16px;font-size:14px;color:#4a5568;">Total Gastos</td>
          <td style="padding:12px 16px;text-align:right;font-weight:700;font-size:14px;color:#e53e3e;">-${formatearPesos(resumen.gastos)}</td>
        </tr>
        <tr style="border-top:2px solid #e2e8f0;">
          <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#2d3748;">Total Esperado</td>
          <td style="padding:14px 16px;text-align:right;font-weight:700;font-size:15px;color:#2d3748;">${formatearPesos(resumen.totalEsperado)}</td>
        </tr>
        <tr style="background:#fff;">
          <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#2d3748;">Plata en Caja</td>
          <td style="padding:14px 16px;text-align:right;font-weight:700;font-size:15px;color:#2d3748;">${formatearPesos(resumen.totalReal)}</td>
        </tr>
        <tr style="background:${diferencia === 0 ? '#f0fff4' : diferencia > 0 ? '#ebf8ff' : '#fff5f5'};">
          <td style="padding:14px 16px;font-size:15px;font-weight:700;color:${diferenciaColor};">Diferencia</td>
          <td style="padding:14px 16px;text-align:right;font-weight:700;font-size:15px;color:${diferenciaColor};">${diferenciaTexto}</td>
        </tr>
      </table>

      <!-- Medios de pago -->
      <h3 style="margin:0 0 12px;font-size:15px;color:#2d3748;">💳 Medios de Pago</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="padding:8px 12px;text-align:left;color:#4a5568;">Medio</th>
            <th style="padding:8px 12px;text-align:right;color:#4a5568;">Total</th>
            <th style="padding:8px 12px;text-align:right;color:#4a5568;">%</th>
          </tr>
        </thead>
        <tbody>${filasMedios}</tbody>
      </table>

      <!-- Retiros -->
      <h3 style="margin:0 0 12px;font-size:15px;color:#2d3748;">💸 Retiros del Día</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
        <tbody>${filasRetiros}</tbody>
      </table>

      <!-- Gastos -->
      <h3 style="margin:0 0 12px;font-size:15px;color:#2d3748;">🧾 Gastos del Día</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;font-size:13px;">
        <tbody>${filasGastos}</tbody>
      </table>

    </div>

    <!-- Footer -->
    <div style="background:#f8f9ff;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#a0aec0;">Heladería POS — Cierre automático del sistema</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Heladería POS" <${process.env.GMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    subject: `🍦 Cierre de Caja — ${fechaFormateada}`,
    html,
  });
};

module.exports = { enviarResumenCierre };
