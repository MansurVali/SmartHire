import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../store';
import BuiltBy from './BuiltBy';

const NAV = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'jobs',      icon: '⬡', label: 'Job Postings' },
  { id: 'pipeline',  icon: '⬢', label: 'Pipeline' },
  { id: 'screen',    icon: '⚡', label: 'Live Screen' },
];

export default function Sidebar({ view, setView }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>SH</div>
        <div>
          <div style={styles.logoText}>SmartHire</div>
          <div style={styles.logoBadge}>AI Hiring</div>
        </div>
      </div>

      {/* Tenant badge */}
      <div style={styles.tenantBadge}>
        <div style={styles.tenantDot} />
        <div>
          <div style={styles.tenantName}>{user?.companyName}</div>
          <div style={styles.tenantId}>{user?.tenantId}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            style={{ ...styles.navBtn, ...(view === n.id ? styles.navActive : {}) }}
          >
            <span style={styles.navIcon}>{n.icon}</span>
            <span>{n.label}</span>
            {view === n.id && <span style={styles.navIndicator} />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button onClick={() => dispatch(clearAuth())} style={styles.logoutBtn}>
          Sign out
        </button>
        <BuiltBy />
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240, minHeight: '100vh',
    background: '#0a0a14',
    borderRight: '1px solid #1a1a2e',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '22px 20px 18px',
    borderBottom: '1px solid #1a1a2e',
  },
  logoIcon: {
    width: 38, height: 38,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
  },
  logoText: { fontSize: 16, fontWeight: 800, color: '#e8e8f8', letterSpacing: '-0.3px' },
  logoBadge: {
    fontSize: 9, fontWeight: 700, color: '#6366f1',
    background: 'rgba(99,102,241,0.12)', borderRadius: 4,
    padding: '1px 6px', marginTop: 2, display: 'inline-block',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  tenantBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '14px 16px',
    padding: '10px 12px',
    background: '#0d0d1f',
    borderRadius: 10,
    border: '1px solid #1e1e35',
  },
  tenantDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
    flexShrink: 0,
  },
  tenantName: { fontSize: 12, fontWeight: 700, color: '#c8c8e8' },
  tenantId:   { fontSize: 10, color: '#4a4a6a', marginTop: 1 },
  nav:    { flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8,
    border: 'none', background: 'transparent',
    color: '#6868a8', cursor: 'pointer',
    fontSize: 13, fontWeight: 500,
    position: 'relative', textAlign: 'left',
    width: '100%',
  },
  navActive: {
    background: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    fontWeight: 600,
  },
  navIcon:      { fontSize: 16 },
  navIndicator: {
    position: 'absolute', right: 10,
    width: 5, height: 5, borderRadius: '50%',
    background: '#6366f1',
  },
  footer: { marginTop: 'auto' },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  userName: { fontSize: 12, fontWeight: 600, color: '#c8c8e8' },
  userRole: { fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.06em' },
  logoutBtn: {
    width: 'calc(100% - 32px)', margin: '0 16px 10px',
    padding: '7px 0',
    background: 'transparent',
    border: '1px solid #1e1e35',
    borderRadius: 7,
    color: '#4a4a6a', cursor: 'pointer',
    fontSize: 12, fontWeight: 500,
  },
};
