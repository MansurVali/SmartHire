import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store';
import { authAPI } from '../api';

export default function LoginPage() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ tenantId: '', email: '', password: '' });
  const [regForm, setRegForm] = useState({
    tenantId: '', companyName: '', industry: '',
    adminName: '', adminEmail: '', adminPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await authAPI.login(loginForm);
      dispatch(setAuth(data));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Try: admin@acme.com / password123 / acme-corp');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authAPI.register(regForm);
      setTab('login');
      setLoginForm({ tenantId: regForm.tenantId, email: regForm.adminEmail, password: regForm.adminPassword });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      {/* Background grid */}
      <div style={S.grid} />

      {/* Glow */}
      <div style={S.glow} />

      <div style={S.container}>
        {/* Left — branding */}
        <div style={S.brand}>
          <div style={S.brandLogo}>SH</div>
          <h1 style={S.brandTitle}>SmartHire</h1>
          <p style={S.brandSub}>AI-Powered Multi-Tenant Hiring Platform</p>

          <div style={S.features}>
            {[
              ['⚡', 'Claude AI Scoring', 'Resume analysis in seconds'],
              ['🏗️', 'Multi-Tenant SaaS', 'Isolated data per company'],
              ['📡', 'Live WebSocket Feed', 'Real-time screening events'],
              ['🔒', 'JWT + RBAC', 'Secure role-based access'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={S.featureItem}>
                <span style={S.featureIcon}>{icon}</span>
                <div>
                  <div style={S.featureTitle}>{title}</div>
                  <div style={S.featureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={S.attribution}>
            Built by{' '}
            <a href="https://github.com/Gangalovaraju" target="_blank" rel="noopener noreferrer" style={S.attrLink}>
              Ganga Lova Raju
            </a>
          </div>
        </div>

        {/* Right — form */}
        <div style={S.formCard}>
          {/* Tabs */}
          <div style={S.tabs}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
                {t === 'login' ? 'Sign In' : 'Register Company'}
              </button>
            ))}
          </div>

          {error && (
            <div style={S.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={S.form}>
              <Field label="Company ID" placeholder="e.g. acme-corp"
                value={loginForm.tenantId}
                onChange={v => setLoginForm(f => ({ ...f, tenantId: v }))} />
              <Field label="Email" type="email" placeholder="hr@company.com"
                value={loginForm.email}
                onChange={v => setLoginForm(f => ({ ...f, email: v }))} />
              <Field label="Password" type="password"
                value={loginForm.password}
                onChange={v => setLoginForm(f => ({ ...f, password: v }))} />

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading ? <Spinner /> : 'Sign In →'}
              </button>

              <div style={S.demoHint}>
                Demo: <code style={S.code}>acme-corp</code> / <code style={S.code}>admin@acme.com</code> / <code style={S.code}>password123</code>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={S.form}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Company ID (slug)" placeholder="acme-corp"
                  value={regForm.tenantId}
                  onChange={v => setRegForm(f => ({ ...f, tenantId: v }))} />
                <Field label="Company Name" placeholder="Acme Corp"
                  value={regForm.companyName}
                  onChange={v => setRegForm(f => ({ ...f, companyName: v }))} />
                <Field label="Industry" placeholder="Technology"
                  value={regForm.industry}
                  onChange={v => setRegForm(f => ({ ...f, industry: v }))} />
                <Field label="Your Name" placeholder="Jane Smith"
                  value={regForm.adminName}
                  onChange={v => setRegForm(f => ({ ...f, adminName: v }))} />
                <Field label="Admin Email" type="email"
                  value={regForm.adminEmail}
                  onChange={v => setRegForm(f => ({ ...f, adminEmail: v }))} />
                <Field label="Password" type="password"
                  value={regForm.adminPassword}
                  onChange={v => setRegForm(f => ({ ...f, adminPassword: v }))} />
              </div>
              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading ? <Spinner /> : 'Create Company →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', placeholder = '', value, onChange }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} required
        onChange={e => onChange(e.target.value)}
        style={S.input} />
    </div>
  );
}

function Spinner() {
  return <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />;
}

const S = {
  page: { minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#1a1a2e 1px, transparent 1px), linear-gradient(90deg, #1a1a2e 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4, pointerEvents: 'none' },
  glow: { position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  container: { position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, maxWidth: 960, width: '100%', alignItems: 'center' },
  brand: { color: '#e8e8f8' },
  brandLogo: { width: 56, height: 56, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 20 },
  brandTitle: { fontSize: 38, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 },
  brandSub: { fontSize: 15, color: '#6868a8', marginBottom: 36, lineHeight: 1.5 },
  features: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 },
  featureItem: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  featureIcon: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  featureTitle: { fontSize: 14, fontWeight: 700, color: '#c8c8e8', marginBottom: 2 },
  featureDesc: { fontSize: 12, color: '#4a4a6a' },
  attribution: { fontSize: 12, color: '#4a4a6a' },
  attrLink: { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
  formCard: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 20, padding: 36 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, background: '#08080f', borderRadius: 10, padding: 4 },
  tab: { flex: 1, padding: '8px', border: 'none', background: 'transparent', color: '#4a4a6a', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  tabActive: { background: '#1a1a2e', color: '#e8e8f8' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', background: '#08080f', border: '1.5px solid #1e1e35', borderRadius: 8, color: '#e8e8f8', fontSize: 14, fontFamily: 'inherit' },
  submitBtn: { padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', marginTop: 4 },
  errorBox: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f43f5e', fontSize: 13, display: 'flex', gap: 8 },
  demoHint: { fontSize: 11, color: '#4a4a6a', textAlign: 'center', marginTop: 6 },
  code: { background: '#1a1a2e', padding: '1px 5px', borderRadius: 3, fontFamily: 'JetBrains Mono, monospace', color: '#818cf8' },
};
