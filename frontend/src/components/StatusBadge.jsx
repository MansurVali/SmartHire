import React from 'react';

const MAP = {
  APPLIED:              { color: '#9898b8', bg: 'rgba(152,152,184,0.12)', dot: '#9898b8' },
  AI_SCREENING:         { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b', pulse: true },
  SHORTLISTED:          { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: '#10b981' },
  INTERVIEW_SCHEDULED:  { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', dot: '#0ea5e9' },
  INTERVIEWED:          { color: '#818cf8', bg: 'rgba(129,140,248,0.12)', dot: '#818cf8' },
  OFFER_SENT:           { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', dot: '#a78bfa' },
  HIRED:                { color: '#34d399', bg: 'rgba(52,211,153,0.15)',  dot: '#34d399' },
  REJECTED:             { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   dot: '#f43f5e' },
  OPEN:                 { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: '#10b981' },
  CLOSED:               { color: '#4a4a6a', bg: 'rgba(74,74,106,0.12)',   dot: '#4a4a6a' },
  DRAFT:                { color: '#9898b8', bg: 'rgba(152,152,184,0.12)', dot: '#9898b8' },
  PAUSED:               { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.APPLIED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0,
        boxShadow: s.pulse ? `0 0 6px ${s.dot}` : 'none',
        animation: s.pulse ? 'pulse-dot 1.5s infinite' : 'none',
      }} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
