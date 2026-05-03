import { useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

export default function AboutPage() {
  const { lang } = useApp();
  const t = useT(lang);
  const a = t.aboutPage;
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <section style={{ padding: '72px 0 56px', background: 'linear-gradient(160deg, var(--bg), var(--bg2))', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 100, fontSize: 12, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 20, background: 'var(--accent-dim)' }}>
            Since 2019
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
            {a.title}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 560, margin: '0 auto' }}>
            {a.subtitle}
          </p>
        </div>
      </section>

      {/* STORY + MISSION */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>{a.story_title}</h2>
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.8 }}>{a.story}</p>
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>{a.mission_title}</h2>
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.8 }}>{a.mission}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 28 }}>
                {[['50K+', lang === 'ua' ? 'Клієнтів' : 'Customers'], ['5★', lang === 'ua' ? 'Рейтинг' : 'Rating'], ['5+', lang === 'ua' ? 'Років' : 'Years']].map(([n, l]) => (
                  <div key={l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{n}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section-sm" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>{a.why_title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
            {a.why.map((item, i) => (
              <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
                <p style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>{a.team_title}</h2>
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.8, textAlign: 'center' }}>{a.team}</p>
        </div>
      </section>

      {/* CONTACTS */}
      <section className="section-sm" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, marginBottom: 20, textAlign: 'center' }}>{a.contacts_title}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
            {[
              { icon: Phone, text: a.phone },
              { icon: Mail, text: a.email },
              { icon: MapPin, text: a.address },
              { icon: Clock, text: a.hours },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14 }}>
                <Icon size={16} color="var(--accent)" />{text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '56px 0', textAlign: 'center' }}>
        <div className="container">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/catalog')} style={{ gap: 8 }}>
            {a.cta} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}