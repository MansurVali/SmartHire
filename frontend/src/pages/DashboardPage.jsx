import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { candidateAPI, jobAPI } from '../api';
import StatusBadge from '../components/StatusBadge';

const STAT_CARDS = [
  { key: 'totalCandidates', label: 'Total Candidates', icon: '👥', color: '#818cf8' },
  { key: 'shortlisted',     label: 'Shortlisted',       icon: '⭐', color: '#10b981' },
  { key: 'hired',           label: 'Hired',             icon: '🎉', color: '#34d399' },
  { key: 'avgAiScore',      label: 'Avg AI Score',      icon: '🤖', color: '#f59e0b', suffix: '/100' },
  { key: 'openJobs',        label: 'Open Positions',    icon: '💼', color: '#0ea5e9' },
  { key: 'rejected',        label: 'Rejected',          icon: '✗',  color: '#f43f5e' },
];

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#f43f5e','#0ea5e9','#8b5cf6'];

export default function DashboardPage({ onJobClick }) {
  const { events } = useSelector(s => s.screening);
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    candidateAPI.dashboard().then(r => setStats(r.data));
    jobAPI.getAll().then(r => setJobs(r.data));
    candidateAPI.getAll().then(r => setCandidates(r.data));
  }, []);

  // Score distribution for chart
  const scoreBuckets = [
    { name: '0–20',   count: candidates.filter(c => c.aiScore !== null && c.aiScore < 20).length },
    { name: '20–40',  count: candidates.filter(c => c.aiScore >= 20 && c.aiScore < 40).length },
    { name: '40–60',  count: candidates.filter(c => c.aiScore >= 40 && c.aiScore < 60).length },
    { name: '60–80',  count: candidates.filter(c => c.aiScore >= 60 && c.aiScore < 80).length },
    { name: '80–100', count: candidates.filter(c => c.aiScore >= 80).length },
  ];

  const statusDist = ['APPLIED','AI_SCREENING','SHORTLISTED','INTERVIEW_SCHEDULED','HIRED','REJECTED']
    .map(s => ({ name: s.replace(/_/g,' '), value: candidates.filter(c => c.status === s).length }))
    .filter(s => s.value > 0);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Hiring Dashboard</h1>
          <p style={S.subtitle}>Real-time overview of your hiring pipeline</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={S.statsGrid}>
        {STAT_CARDS.map(card => (
          <div key={card.key} style={S.statCard} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: '#4a4a6a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: card.color, letterSpacing: '-1px' }}>
                  {stats[card.key] ?? 0}{card.suffix || ''}
                </div>
              </div>
              <div style={{ fontSize: 22, opacity: 0.8 }}>{card.icon}</div>
            </div>
            <div style={{ height: 3, background: '#1a1a2e', borderRadius: 2, marginTop: 16 }}>
              <div style={{ height: '100%', width: `${Math.min(100, ((stats[card.key] ?? 0) / Math.max(1, stats.totalCandidates || 1)) * 100)}%`, background: card.color, borderRadius: 2, transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={S.chartsRow}>
        {/* Score distribution */}
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>AI Score Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={scoreBuckets} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#2a2a45" tick={{ fill: '#4a4a6a', fontSize: 11 }} />
              <YAxis stroke="transparent" tick={{ fill: '#4a4a6a', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 8, color: '#e8e8f8' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>Pipeline Status</h3>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 8, color: '#e8e8f8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a45', fontSize: 13 }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: recent jobs + live events */}
      <div style={S.bottomRow}>
        <div style={S.panel}>
          <h3 style={S.panelTitle}>Recent Job Postings</h3>
          <div>
            {jobs.slice(0, 6).map(job => (
              <div key={job.id} style={S.jobRow} onClick={() => onJobClick?.(job)}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#e8e8f8', marginBottom: 2 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: '#4a4a6a' }}>📍 {job.location || 'Remote'} · {job.jobType}</div>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
            {jobs.length === 0 && <div style={S.empty}>No jobs yet. Create your first posting.</div>}
          </div>
        </div>

        <div style={S.panel}>
          <h3 style={S.panelTitle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, background: '#f59e0b', borderRadius: '50%', animation: 'pulse-dot 1.5s infinite', display: 'inline-block' }} />
              Live AI Events
            </span>
          </h3>
          <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.length === 0 ? (
              <div style={S.empty}>Submit a candidate to see live AI scoring events.</div>
            ) : events.slice(0, 15).map(ev => (
              <div key={ev.id} style={S.eventRow}>
                <span style={S.eventTime}>{new Date(ev.id).toLocaleTimeString()}</span>
                <span style={{ color: '#c8c8e8', fontSize: 13 }}>
                  {ev.event === 'SCORING_COMPLETE' && `🤖 ${ev.name} scored ${ev.score}/100 — ${ev.recommendation}`}
                  {ev.event === 'SCREENING_STARTED' && `⏳ Screening ${ev.name}...`}
                  {ev.event === 'SCORING_FAILED' && `❌ Scoring failed for candidate #${ev.candidateId}`}
                  {!['SCORING_COMPLETE','SCREENING_STARTED','SCORING_FAILED'].includes(ev.event) && ev.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { padding: '28px 32px', maxWidth: 1280, margin: '0 auto', animation: 'fadeIn 0.3s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 800, color: '#e8e8f8', letterSpacing: '-0.5px', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#4a4a6a' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 },
  statCard: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 20 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  chartCard: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 20 },
  chartTitle: { fontSize: 12, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  panel: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 20 },
  panelTitle: { fontSize: 12, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 },
  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a2e', cursor: 'pointer' },
  eventRow: { display: 'flex', gap: 10, padding: '6px 10px', background: '#12121f', borderRadius: 6, alignItems: 'flex-start' },
  eventTime: { fontSize: 10, color: '#2a2a45', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', marginTop: 2 },
  empty: { color: '#2a2a45', fontSize: 13, padding: '24px 0', textAlign: 'center' },
};
