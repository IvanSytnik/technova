const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const FROM = () => process.env.SMTP_FROM || `"TechNova" <${process.env.SMTP_USER}>`;
const BASE_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';
const fmt = (n) => Number(n).toLocaleString('uk-UA');
const canSend = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const verifyEmailHTML = (name, token) => {
  const url = `${BASE_URL()}/verify-email?token=${token}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>body{font-family:-apple-system,sans-serif;background:#f0f4f8;color:#1a202c}.wrap{max-width:560px;margin:0 auto;padding:24px 16px}.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.head{background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px;text-align:center}.logo{font-size:26px;font-weight:800;color:#fff}.logo span{color:#93c5fd}.body{padding:32px}h2{font-size:20px;margin-bottom:12px}p{color:#64748b;line-height:1.7;margin-bottom:16px}.btn{display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px}.note{font-size:12px;color:#94a3b8;margin-top:20px}.foot{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#94a3b8}</style>
  </head><body><div class="wrap"><div class="card">
    <div class="head"><div class="logo">Tech<span>Nova</span></div></div>
    <div class="body">
      <h2>Привіт, ${name}! 👋</h2>
      <p>Дякуємо за реєстрацію в TechNova. Підтвердіть вашу email-адресу, щоб активувати акаунт.</p>
      <a href="${url}" class="btn">✉️ Підтвердити Email</a>
      <p class="note">Посилання дійсне 24 години. Якщо ви не реєструвались — проігноруйте цей лист.</p>
    </div>
    <div class="foot">© 2025 TechNova Ukraine</div>
  </div></div></body></html>`;
};

const resetPasswordHTML = (name, token) => {
  const url = `${BASE_URL()}/reset-password?token=${token}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>body{font-family:-apple-system,sans-serif;background:#f0f4f8;color:#1a202c}.wrap{max-width:560px;margin:0 auto;padding:24px 16px}.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.head{background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center}.logo{font-size:26px;font-weight:800;color:#fff}.logo span{color:#c4b5fd}.body{padding:32px}h2{font-size:20px;margin-bottom:12px}p{color:#64748b;line-height:1.7;margin-bottom:16px}.btn{display:inline-block;padding:14px 32px;background:#7c3aed;color:#fff;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px}.note{font-size:12px;color:#94a3b8;margin-top:20px}.foot{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#94a3b8}</style>
  </head><body><div class="wrap"><div class="card">
    <div class="head"><div class="logo">Tech<span>Nova</span></div></div>
    <div class="body">
      <h2>${name}, скидання пароля 🔐</h2>
      <p>Ми отримали запит на скидання пароля для вашого акаунту.</p>
      <a href="${url}" class="btn">🔑 Скинути пароль</a>
      <p class="note">Посилання дійсне 1 годину. Якщо ви не запитували — проігноруйте цей лист.</p>
    </div>
    <div class="foot">© 2025 TechNova Ukraine</div>
  </div></div></body></html>`;
};

const orderConfirmHTML = (order, lang = 'ua') => {
  const isUa = lang === 'ua';
  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>body{font-family:-apple-system,sans-serif;background:#f0f4f8;color:#1a202c}.wrap{max-width:600px;margin:0 auto;padding:24px 16px}.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.head{background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:36px 32px;text-align:center}.logo{font-size:28px;font-weight:800;color:#fff}.logo span{color:#93c5fd}.body{padding:32px}.order-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px}.status{display:inline-block;padding:4px 14px;background:#dbeafe;color:#1d4ed8;border-radius:100px;font-size:12px;font-weight:600;margin-top:8px}.item{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9}.item:last-child{border-bottom:none}.total-row{display:flex;justify-content:space-between;padding:16px 0;border-top:2px solid #e2e8f0}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}.info-box{background:#f8fafc;border-radius:10px;padding:14px}.info-label{font-size:11px;color:#94a3b8;text-transform:uppercase;margin-bottom:4px}.info-value{font-size:14px;font-weight:600}.foot{background:#f8fafc;padding:24px;text-align:center;font-size:13px;color:#94a3b8}</style>
  </head><body><div class="wrap"><div class="card">
    <div class="head"><div class="logo">Tech<span>Nova</span></div><p style="color:#bfdbfe;margin-top:6px;font-size:14px">${isUa ? 'Дякуємо за замовлення!' : 'Thank you for your order!'}</p></div>
    <div class="body">
      <p style="font-size:18px;font-weight:700;margin-bottom:8px">${isUa ? `Привіт, ${order.customer_name}!` : `Hello, ${order.customer_name}!`} 👋</p>
      <p style="color:#64748b;margin-bottom:20px">${isUa ? 'Ваше замовлення успішно прийнято.' : 'Your order has been received.'}</p>
      <div class="order-box">
        <div style="font-size:11px;color:#64748b">${isUa ? 'Номер замовлення' : 'Order Number'}</div>
        <div style="font-size:22px;font-weight:800;color:#1e3a5f;font-family:monospace">#${order.order_number}</div>
        <span class="status">⏳ ${isUa ? 'В обробці' : 'Processing'}</span>
      </div>
      ${items.map(i => `<div class="item"><span style="font-size:14px;font-weight:500;flex:1">${i.name_ua || i.name}</span><span style="color:#64748b;margin:0 12px">×${i.qty}</span><span style="font-weight:700;color:#1e3a5f">${fmt(i.price * i.qty)} ${isUa ? 'грн' : 'UAH'}</span></div>`).join('')}
      <div class="total-row"><span style="font-size:16px;font-weight:600">${isUa ? 'Разом' : 'Total'}</span><span style="font-size:22px;font-weight:800;color:#2563eb;font-family:monospace">${fmt(order.total)} ${isUa ? 'грн' : 'UAH'}</span></div>
      <div class="info-grid">
        <div class="info-box"><div class="info-label">${isUa ? 'Телефон' : 'Phone'}</div><div class="info-value">${order.customer_phone}</div></div>
        <div class="info-box"><div class="info-label">Email</div><div class="info-value">${order.customer_email}</div></div>
        <div class="info-box"><div class="info-label">${isUa ? 'Місто' : 'City'}</div><div class="info-value">${order.customer_city || '—'}</div></div>
        <div class="info-box"><div class="info-label">${isUa ? 'Доставка' : 'Delivery'}</div><div class="info-value">${order.delivery_method === 'nova_poshta' ? 'Нова Пошта' : order.delivery_method === 'ukrposhta' ? 'Укрпошта' : "Кур'єр / Courier"}</div></div>
      </div>
    </div>
    <div class="foot"><p>${isUa ? 'Питання?' : 'Questions?'} <strong>${process.env.ADMIN_NOTIFY_EMAIL || 'support@technova.ua'}</strong></p><p style="margin-top:8px">© 2025 TechNova Ukraine</p></div>
  </div></div></body></html>`;
};

const adminOrderHTML = (order) => {
  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>body{font-family:-apple-system,sans-serif;background:#f0f4f8}.wrap{max-width:600px;margin:0 auto;padding:24px 16px}.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.head{background:#1e293b;padding:24px 32px;display:flex;align-items:center;gap:12px}.badge{background:#ef4444;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px}.logo{font-size:20px;font-weight:800;color:#fff}.body{padding:28px 32px}h2{font-size:18px;margin-bottom:16px}.meta{background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:20px;font-size:14px;line-height:2}table{width:100%;border-collapse:collapse;font-size:14px}th{background:#f1f5f9;padding:10px 12px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase}td{padding:10px 12px;border-bottom:1px solid #f1f5f9}.foot{background:#f8fafc;padding:16px 32px;font-size:12px;color:#94a3b8;text-align:center}</style>
  </head><body><div class="wrap"><div class="card">
    <div class="head"><div class="logo">TechNova</div><span class="badge">🔔 НОВЕ ЗАМОВЛЕННЯ</span></div>
    <div class="body">
      <h2>Замовлення #${order.order_number}</h2>
      <div class="meta"><strong>Ім'я:</strong> ${order.customer_name}<br><strong>Email:</strong> ${order.customer_email}<br><strong>Телефон:</strong> ${order.customer_phone}<br><strong>Місто:</strong> ${order.customer_city || '—'}<br><strong>Адреса:</strong> ${order.customer_address || '—'}<br><strong>Доставка:</strong> ${order.delivery_method}<br><strong>Оплата:</strong> ${order.payment_method}</div>
      <table><tr><th>Товар</th><th>К-сть</th><th>Ціна</th><th>Сума</th></tr>
      ${items.map(i => `<tr><td>${i.name_ua || i.name}</td><td>${i.qty}</td><td>${fmt(i.price)} грн</td><td>${fmt(i.price * i.qty)} грн</td></tr>`).join('')}
      <tr><td colspan="3" style="font-weight:700;padding:12px">РАЗОМ</td><td style="font-size:18px;font-weight:800;color:#2563eb;font-family:monospace;padding:12px">${fmt(order.total)} грн</td></tr></table>
    </div>
    <div class="foot">Отримано: ${new Date().toLocaleString('uk-UA')}</div>
  </div></div></body></html>`;
};

const sendVerificationEmail = async (customer, token) => {
  if (!canSend()) { console.log('⚠️ Email off. Verify token:', token); return { success: false }; }
  try {
    await createTransporter().sendMail({ from: FROM(), to: customer.email, subject: 'TechNova — Підтвердіть email ✉️', html: verifyEmailHTML(customer.first_name, token) });
    return { success: true };
  } catch (e) { console.error('Email error:', e.message); return { success: false }; }
};

const sendResetEmail = async (customer, token) => {
  if (!canSend()) { console.log('⚠️ Email off. Reset token:', token); return { success: false }; }
  try {
    await createTransporter().sendMail({ from: FROM(), to: customer.email, subject: 'TechNova — Скидання пароля 🔐', html: resetPasswordHTML(customer.first_name, token) });
    return { success: true };
  } catch (e) { console.error('Email error:', e.message); return { success: false }; }
};

const sendOrderEmails = async (order) => {
  if (!canSend()) { console.log('⚠️ Email off. Order:', order.order_number); return { success: false }; }
  try {
    const t = createTransporter();
    await t.sendMail({ from: FROM(), to: order.customer_email, subject: `Ваше замовлення #${order.order_number} прийнято ✓`, html: orderConfirmHTML(order, order.lang || 'ua') });
    if (process.env.ADMIN_NOTIFY_EMAIL) await t.sendMail({ from: FROM(), to: process.env.ADMIN_NOTIFY_EMAIL, subject: `🔔 Нове замовлення #${order.order_number}`, html: adminOrderHTML(order) });
    console.log(`✅ Emails sent: #${order.order_number}`);
    return { success: true };
  } catch (e) { console.error('Email error:', e.message); return { success: false }; }
};

module.exports = { sendVerificationEmail, sendResetEmail, sendOrderEmails };
