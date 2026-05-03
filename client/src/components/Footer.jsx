import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

export default function Footer() {
  const { lang } = useApp();
  const t = useT(lang);

  const cols = [
    {
      title: t.nav.catalog,
      links: Object.entries(t.categories).filter(([k]) => k !== 'all').map(([k, v]) => ({ to: `/catalog?cat=${k}`, label: v })),
    },
    {
      title: lang === 'ua' ? 'Компанія' : 'Company',
      links: [
        { to: '/', label: lang === 'ua' ? 'Про нас' : 'About Us' },
        { to: '/', label: lang === 'ua' ? 'Блог' : 'Blog' },
        { to: '/', label: lang === 'ua' ? 'Вакансії' : 'Careers' },
        { to: '/', label: lang === 'ua' ? 'Партнери' : 'Partners' },
      ],
    },
    {
      title: lang === 'ua' ? 'Підтримка' : 'Support',
      links: [
        { to: '/', label: lang === 'ua' ? 'Доставка' : 'Delivery' },
        { to: '/', label: lang === 'ua' ? 'Гарантія' : 'Warranty' },
        { to: '/', label: lang === 'ua' ? 'Повернення' : 'Returns' },
        { to: '/', label: 'FAQ' },
      ],
    },
  ];

  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '56px 0 28px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="logo-icon"><Cpu size={17} color="#fff" /></div>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800 }}>
                Tech<span style={{ color: 'var(--accent)' }}>Nova</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
              {t.footer.tagline}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: Phone, text: '+380 800 123 456' },
                { icon: Mail, text: 'info@technova.ua' },
                { icon: MapPin, text: lang === 'ua' ? 'Київ, Україна' : 'Kyiv, Ukraine' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                  <Icon size={14} color="var(--accent)" />{text}
                </div>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} style={{ fontSize: 13, color: 'var(--text2)', transition: 'color .15s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text2)'}
                    >{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment icons + copyright */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>© 2025 TechNova Ukraine. {t.footer.rights}.</p>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6, opacity: 0.6 }}>
  В.С. Федоров | Група: ІН-26-3 | Керівник: Н.Л. Барченко | Кваліфікаційна робота бакалавра
</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Visa', 'Mastercard', 'Privat24', 'IBAN'].map(p => (
              <span key={p} style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{p}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms', 'Cookies'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'var(--text2)', transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--text2)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){footer .container > div:first-child{grid-template-columns:1fr 1fr!important;}}
        @media(max-width:560px){footer .container > div:first-child{grid-template-columns:1fr!important;}}
      `}</style>
    </footer>
  );
}
