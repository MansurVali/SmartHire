import React, { useEffect, useState } from 'react';
import { candidateAPI, jobAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import ScoreRing from '../components/ScoreRing';

const STATUSES = ['APPLIED','AI_SCREENING','SHORTLISTED','INTERVIEW_SCHEDULED','INTERVIEWED','OFFER_SENT','HIRED','REJECTED'];

export default function PipelinePage({ initialJob, onBack }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(initialJob || null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', resumeText: '', linkedinUrl: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => { jobAPI.getAll().then(r => setJobs(r.data)); }, []);

  useEffect(() => {
    if (selectedJob) loadCandidates(selectedJob.id);
  }, [selectedJob]);

  // Auto-refresh candidates while any are AI_SCREENING
  useEffect(() => {
    if (!selectedJob) return;
    const screening = candidates.some(c => c.status === 'AI_SCREENING');
    if (!screening) return;
    const t = setTimeout(() => loadCandidates(selectedJob.id), 3000);
    return () => clearTimeout(t);
  }, [candidates, selectedJob]);

  const loadCandidates = async (jobId) => {
    setLoading(true);
    try { const r = await candidateAPI.getByJob(jobId); setCandidates(r.data); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await candidateAPI.submit({ ...form, jobPostingId: selectedJob.id });
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', resumeText: '', linkedinUrl: '' });
      await loadCandidates(selectedJob.id);
    } finally { setSubmitting(false); }
  };

  const updateStatus = async (id, status) => {
    await candidateAPI.updateStatus(id, status);
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    await loadCandidates(selectedJob.id);
  };

  const filtered = filterStatus === 'ALL' ? candidates : candidates.filter(c => c.status === filterStatus);

  if (!selectedJob) {
    return (
      <div style={S.page}>
        <h1 style={S.title}>Candidate Pipeline</h1>
        <p style={S.subtitle}>Select a job posting to view its pipeline</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 24 }}>
          {jobs.map(job => (
            <div key={job.id} style={S.jobPick} onClick={() => setSelectedJob(job)}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{job.title}</div>
              <div style={{ fontSize: 12, color: '#4a4a6a', marginBottom: 12 }}>📍 {job.location} · {job.jobType}</div>
              <StatusBadge status={job.status} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSelectedJob(null)} style={S.backBtn}>← Jobs</button>
          <div>
            <h1 style={S.title}>{selectedJob.title}</h1>
            <p style={S.subtitle}>📍 {selectedJob.location} · {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={S.primaryBtn}>
          {showForm ? '✕ Cancel' : '+ Submit Candidate'}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <div style={S.formCard} className="fade-in">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8e8f8', marginBottom: 18 }}>
            Submit Candidate Application
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['name','Full Name *','Jane Smith'],['email','Email *','jane@example.com'],['phone','Phone',''],['linkedinUrl','LinkedIn URL','linkedin.com/in/...']].map(([k,lbl,ph]) => (
                <div key={k}>
                  <label style={S.label}>{lbl}</label>
                  <input type={k==='email'?'email':'text'} placeholder={ph} value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    required={k === 'name' || k === 'email'}
                    style={S.input} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={S.label}>Resume Text * — Paste full resume content</label>
              <textarea
                placeholder={`Paste the candidate's complete resume here.\n\nThe AI will analyze:\n• Skill match against: ${selectedJob.requiredSkills}\n• Experience & seniority\n• Strengths and gaps\n• Potential bias indicators\n\nMore resume text = more accurate AI scoring.`}
                value={form.resumeText}
                onChange={e => setForm(f => ({ ...f, resumeText: e.target.value }))}
                required
                style={{ ...S.input, height: 160, resize: 'vertical' }}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="submit" style={S.primaryBtn} disabled={submitting}>
                {submitting ? '⏳ Submitting & Starting AI...' : '🤖 Submit & Start AI Screening →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div style={S.filterBar}>
        {['ALL', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ ...S.filterBtn, ...(filterStatus === s ? S.filterActive : {}) }}>
            {s.replace(/_/g,' ')}
            {s !== 'ALL' && (
              <span style={S.filterCount}>{candidates.filter(c => c.status === s).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main split view */}
      <div style={S.split}>
        {/* Candidate list */}
        <div style={S.listPanel}>
          {loading && <div style={{ textAlign: 'center', color: '#4a4a6a', padding: 20 }}>Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#2a2a45', padding: 40 }}>
              No candidates{filterStatus !== 'ALL' ? ` with status ${filterStatus}` : ' yet'}
            </div>
          )}
          {filtered.map(c => (
            <div key={c.id}
              onClick={() => setSelected(c)}
              style={{ ...S.candidateCard, ...(selected?.id === c.id ? S.cardSelected : {}) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#e8e8f8' }}>{c.name}</div>
                {c.aiScore !== null ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c.aiScore >= 75 ? '#10b981' : c.aiScore >= 50 ? '#f59e0b' : '#f43f5e' }}>
                      {c.aiScore}
                    </div>
                    <div style={{ fontSize: 9, color: '#4a4a6a' }}>AI SCORE</div>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: '#f59e0b', animation: 'pulse-dot 1.5s infinite' }}>⏳ AI</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#4a4a6a', marginBottom: 8 }}>{c.email}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={c.status} />
                {c.skillMatchPct !== null && (
                  <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
                    Skills: {c.skillMatchPct}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={S.detailPanel} className="slide-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e8e8f8', marginBottom: 4 }}>{selected.name}</h2>
                <div style={{ fontSize: 13, color: '#4a4a6a' }}>{selected.email} · {selected.phone}</div>
                {selected.linkedinUrl && <a href={selected.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#6366f1' }}>LinkedIn →</a>}
              </div>
              {selected.aiScore !== null && (
                <ScoreRing score={selected.aiScore} size={88} />
              )}
            </div>

            {/* AI recommendation badge */}
            {selected.aiRecommendation && (
              <div style={{
                padding: '8px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 700,
                background: selected.aiRecommendation === 'SHORTLIST' ? 'rgba(16,185,129,0.1)' : selected.aiRecommendation === 'HOLD' ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)',
                color: selected.aiRecommendation === 'SHORTLIST' ? '#10b981' : selected.aiRecommendation === 'HOLD' ? '#f59e0b' : '#f43f5e',
                border: `1px solid currentColor`,
              }}>
                🤖 AI Recommendation: {selected.aiRecommendation}
                {selected.aiProcessingMs > 0 && <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 8, opacity: 0.7 }}>({selected.aiProcessingMs}ms)</span>}
              </div>
            )}

            {/* AI sections */}
            {selected.aiSummary && <AISection title="Summary" content={selected.aiSummary} color="#818cf8" />}
            {selected.skillMatchPct !== null && (
              <div style={S.aiBlock}>
                <div style={S.aiLabel}>Skill Match</div>
                <div style={{ height: 6, background: '#1a1a2e', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${selected.skillMatchPct}%`, background: selected.skillMatchPct >= 70 ? '#10b981' : '#f59e0b', borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: '#4a4a6a', marginTop: 4 }}>{selected.skillMatchPct}% of required skills matched</div>
              </div>
            )}
            {selected.aiStrengths && <AISection title="Strengths" content={selected.aiStrengths} color="#10b981" bg="rgba(16,185,129,0.06)" />}
            {selected.aiGaps && <AISection title="Gaps" content={selected.aiGaps} color="#f59e0b" bg="rgba(245,158,11,0.06)" />}
            {selected.biasFlags && selected.biasFlags !== 'none' && (
              <AISection title="⚠️ Bias Flags" content={selected.biasFlags} color="#f43f5e" bg="rgba(244,63,94,0.06)" />
            )}

            {/* Status actions */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1e1e35' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Update Status
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {STATUSES.filter(s => s !== 'AI_SCREENING').map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    style={{ ...S.statusBtn, ...(selected.status === s ? S.statusBtnActive : {}) }}>
                    {s.replace(/_/g,' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Model info */}
            {selected.aiModelUsed && (
              <div style={{ marginTop: 14, fontSize: 10, color: '#2a2a45', fontFamily: 'JetBrains Mono, monospace' }}>
                Scored by {selected.aiModelUsed} · {selected.aiProcessedAt?.split('T')[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AISection({ title, content, color, bg = '#0d0d1a' }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#c8c8e8', lineHeight: 1.6 }}>{content}</div>
    </div>
  );
}

const S = {
  page: { padding: '28px 32px', maxWidth: 1280, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 800, color: '#e8e8f8', letterSpacing: '-0.5px', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#4a4a6a' },
  backBtn: { padding: '7px 14px', background: 'transparent', border: '1px solid #1e1e35', borderRadius: 8, color: '#4a4a6a', cursor: 'pointer', fontSize: 13 },
  primaryBtn: { padding: '9px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  formCard: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 24, marginBottom: 20 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', background: '#08080f', border: '1.5px solid #1e1e35', borderRadius: 8, color: '#e8e8f8', fontSize: 14, fontFamily: 'inherit' },
  filterBar: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 },
  filterBtn: { padding: '5px 12px', border: '1px solid #1e1e35', borderRadius: 20, background: 'transparent', color: '#4a4a6a', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 },
  filterActive: { background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: '#6366f1' },
  filterCount: { background: '#1a1a2e', borderRadius: 10, padding: '0 5px', fontSize: 10 },
  split: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, alignItems: 'start' },
  listPanel: { display: 'flex', flexDirection: 'column', gap: 10 },
  candidateCard: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 12, padding: 16, cursor: 'pointer' },
  cardSelected: { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' },
  detailPanel: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 22, position: 'sticky', top: 20 },
  aiBlock: { marginBottom: 12, padding: '12px 14px', background: '#12121f', borderRadius: 8 },
  aiLabel: { fontSize: 10, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  statusBtn: { padding: '5px 12px', background: 'transparent', border: '1px solid #1e1e35', borderRadius: 6, color: '#4a4a6a', cursor: 'pointer', fontSize: 11, fontWeight: 600 },
  statusBtnActive: { background: 'rgba(99,102,241,0.15)', borderColor: '#6366f1', color: '#818cf8' },
  jobPick: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 20, cursor: 'pointer' },
};
