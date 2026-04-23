const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const fmt = (n) => Number(n).toLocaleString('uk-UA');

const customerEmailUA = (order) => `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ваше замовлення #${order.order_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4f8; color: #1a202c; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
  .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 36px 32px; text-align: center; }
  .logo { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.03em; }
  .logo span { color: #93c5fd; }
  .header p { color: #bfdbfe; margin-top: 6px; font-size: 14px; }
  .body { padding: 32px; }
  .greeting { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .subtitle { color: #64748b; font-size: 15px; margin-bottom: 28px; line-height: 1.6; }
  .order-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .order-num { font-size: 13px; color: #64748b; margin-bottom: 4px; }
  .order-num strong { font-size: 22px; color: #1e3a5f; font-family: monospace; }
  .status { display: inline-block; padding: 4px 14px; background: #dbeafe; color: #1d4ed8; border-radius: 100px; font-size: 12px; font-weight: 600; margin-top: 8px; }
  .section-title { font-size: 13px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
  .item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
  .item:last-child { border-bottom: none; }
  .item-name { font-size: 14px; font-weight: 500; flex: 1; }
  .item-qty { font-size: 13px; color: #64748b; margin: 0 12px; }
  .item-price { font-size: 14px; font-weight: 700; color: #1e3a5f; white-space: nowrap; }
  .total-row { display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #e2e8f0; margin-top: 8px; }
  .total-label { font-size: 16px; font-weight: 600; }
  .total-price { font-size: 22px; font-weight: 800; color: #2563eb; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
  .info-box { background: #f8fafc; border-radius: 10px; padding: 14px; }
  .info-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .info-value { font-size: 14px; font-weight: 600; }
  .footer { background: #f8fafc; padding: 24px 32px; text-align: center; }
  .footer p { font-size: 13px; color: #94a3b8; line-height: 1.7; }
  .footer strong { color: #64748b; }
</style></head>
<body>
<div class="wrapper">
<div class="card">
  <div class="header">
    <div class="logo">Tech<span>Nova</span></div>
    <p>Дякуємо за ваше замовлення!</p>
  </div>
  <div class="body">
    <p class="greeting">Привіт, ${order.customer_name}! 👋</p>
    <p class="subtitle">Ваше замовлення успішно прийнято та передано на обробку. Ми зв'яжемося з вами найближчим часом.</p>
    <div class="order-info">
      <div class="order-num">Номер замовлення</div>
      <div class="order-num"><strong>#${order.order_number}</strong></div>
      <span class="status">⏳ В обробці</span>
    </div>
    <div class="section-title">Товари</div>
    ${order.items.map(i => `
      <div class="item">
        <span class="item-name">${i.name_ua || i.name}</span>
        <span class="item-qty">× ${i.qty}</span>
        <span class="item-price">${fmt(i.price * i.qty)} грн</span>
      </div>
    `).join('')}
    <div class="total-row">
      <span class="total-label">Разом до сплати</span>
      <span class="total-price">${fmt(order.total)} грн</span>
    </div>
    <div class="info-grid">
      <div class="info-box"><div class="info-label">Телефон</div><div class="info-value">${order.customer_phone}</div></div>
      <div class="info-box"><div class="info-label">Email</div><div class="info-value">${order.customer_email}</div></div>
      <div class="info-box"><div class="info-label">Місто</div><div class="info-value">${order.customer_city || '—'}</div></div>
      <div class="info-box"><div class="info-label">Доставка</div><div class="info-value">${order.delivery_method === 'nova_poshta' ? 'Нова Пошта' : order.delivery_method === 'ukrposhta' ? 'Укрпошта' : 'Кур\'єр'}</div></div>
    </div>
    ${order.customer_address ? `<div class="info-box" style="margin-bottom:16px"><div class="info-label">Адреса / Відділення</div><div class="info-value">${order.customer_address}</div></div>` : ''}
  </div>
  <div class="footer">
    <p>Питання? Пишіть: <strong>${process.env.ADMIN_NOTIFY_EMAIL || 'support@technova.ua'}</strong></p>
    <p style="margin-top:8px">© 2025 TechNova Ukraine. Всі права захищені.</p>
  </div>
</div>
</div>
</body>
</html>
`;

const adminEmailTemplate = (order) => `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8">
<title>Нове замовлення #${order.order_number}</title>
<style>
  body { font-family: -apple-system,sans-serif; background: #f0f4f8; color: #1a202c; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
  .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  .header { background: #1e293b; padding: 24px 32px; display: flex; align-items: center; gap: 12px; }
  .badge { background: #ef4444; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
  .logo { font-size: 20px; font-weight: 800; color: #fff; }
  .body { padding: 28px 32px; }
  h2 { font-size: 18px; margin-bottom: 16px; }
  .meta { background: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 14px; line-height: 2; }
  .meta strong { color: #1e3a5f; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
  .total { font-size: 18px; font-weight: 800; color: #2563eb; padding: 16px 12px; }
  .footer { background: #f8fafc; padding: 16px 32px; font-size: 12px; color: #94a3b8; text-align: center; }
</style></head>
<body>
<div class="wrapper"><div class="card">
  <div class="header">
    <div class="logo">TechNova</div>
    <span class="badge">🔔 НОВЕ ЗАМОВЛЕННЯ</span>
  </div>
  <div class="body">
    <h2>Замовлення #${order.order_number}</h2>
    <div class="meta">
      <strong>Ім'я:</strong> ${order.customer_name}<br>
      <strong>Email:</strong> ${order.customer_email}<br>
      <strong>Телефон:</strong> ${order.customer_phone}<br>
      <strong>Місто:</strong> ${order.customer_city || '—'}<br>
      <strong>Адреса:</strong> ${order.customer_address || '—'}<br>
      <strong>Доставка:</strong> ${order.delivery_method}<br>
      <strong>Оплата:</strong> ${order.payment_method}<br>
      ${order.notes ? `<strong>Примітки:</strong> ${order.notes}` : ''}
    </div>
    <table>
      <tr><th>Товар</th><th>К-сть</th><th>Ціна</th><th>Сума</th></tr>
      ${order.items.map(i => `<tr><td>${i.name_ua || i.name}</td><td>${i.qty}</td><td>${fmt(i.price)} грн</td><td>${fmt(i.price * i.qty)} грн</td></tr>`).join('')}
      <tr><td colspan="3" style="font-weight:700;padding:12px">РАЗОМ</td><td class="total">${fmt(order.total)} грн</td></tr>
    </table>
  </div>
  <div class="footer">Отримано: ${new Date().toLocaleString('uk-UA')}</div>
</div></div>
</body></html>
`;

const sendOrderEmails = async (order) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Email not configured. Skipping email send.');
    console.log('Order:', order.order_number, '| Customer:', order.customer_email);
    return { success: false, reason: 'Email not configured' };
  }

  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || `"TechNova" <${process.env.SMTP_USER}>`;

  try {
    // Customer email
    await transporter.sendMail({
      from,
      to: order.customer_email,
      subject: `Ваше замовлення #${order.order_number} прийнято ✓ — TechNova`,
      html: customerEmailUA(order),
    });

    // Admin notification
    if (process.env.ADMIN_NOTIFY_EMAIL) {
      await transporter.sendMail({
        from,
        to: process.env.ADMIN_NOTIFY_EMAIL,
        subject: `🔔 Нове замовлення #${order.order_number} — ${order.customer_name}`,
        html: adminEmailTemplate(order),
      });
    }

    console.log(`✅ Emails sent for order #${order.order_number}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Email error:', err.message);
    return { success: false, reason: err.message };
  }
};

module.exports = { sendOrderEmails };
