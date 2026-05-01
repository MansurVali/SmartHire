import React, { useEffect, useState } from 'react';
import { jobAPI } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function JobsPage({ onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', requiredSkills: '', location: '', jobType: 'FULL_TIME', experienceYears: '', salaryRange: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => jobAPI.getAll().then(r => setJobs(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await jobAPI.create(form); setShowForm(false); load(); setForm({ title: '', description: '', requiredSkills: '', location: '', jobType: 'FULL_TIME', experienceYears: '', salaryRange: '' }); }
    finally { setLoading(false); }
  };

  const handleClose = async (job) => {
    await jobAPI.update(job.id, { ...job, status: job.status === 'OPEN' ? 'CLOSED' : 'OPEN' });
    load();
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Job Postings</h1>
          <p style={S.subtitle}>{jobs.filter(j => j.status === 'OPEN').length} open positions</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)}
            style={S.searchInput} />
          <button onClick={() => setShowForm(v => !v)} style={S.primaryBtn}>
            {showForm ? '✕ Cancel' : '+ New Job'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={S.formCard} className="fade-in">
          <h3 style={S.formTitle}>Create Job Posting</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Job Title *" placeholder="Senior Java Developer" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
              <Field label="Location" placeholder="Hyderabad / Remote" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
              <div>
                <label style={S.label}>Job Type</label>
                <select value={form.jobType} onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))} style={S.select}>
                  {['FULL_TIME','PART_TIME','CONTRACT','REMOTE'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <Field label="Experience" placeholder="3-5 years" value={form.experienceYears} onChange={v => setForm(f => ({ ...f, experienceYears: v }))} />
              <Field label="Salary Range" placeholder="₹15L–₹25L/yr" value={form.salaryRange} onChange={v => setForm(f => ({ ...f, salaryRange: v }))} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={S.label}>Required Skills * (comma-separated)</label>
              <input placeholder="Java, Spring Boot, React, PostgreSQL, Docker" value={form.requiredSkills}
                onChange={e => setForm(f => ({ ...f, requiredSkills: e.target.value }))}
                style={S.input} required />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={S.label}>Job Description *</label>
              <textarea placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ ...S.input, height: 110, resize: 'vertical' }} required />
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button type="submit" style={S.primaryBtn} disabled={loading}>
                {loading ? 'Posting...' : 'Post Job →'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={S.grid}>
        {filtered.map(job => (
          <div key={job.id} style={S.card} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={S.jobType}>{job.jobType}</div>
              <StatusBadge status={job.status} />
            </div>
            <h3 style={S.jobTitle} onClick={() => onSelectJob(job)}>{job.title}</h3>
            <div style={S.jobMeta}>
              {job.location && <span>📍 {job.location}</span>}
              {job.experienceYears && <span>⏱ {job.experienceYears}</span>}
              {job.salaryRange && <span>💰 {job.salaryRange}</span>}
            </div>
            {job.requiredSkills && (
              <div style={S.skills}>
                {job.requiredSkills.split(',').slice(0, 4).map(s => (
                  <span key={s} style={S.skill}>{s.trim()}</span>
                ))}
                {job.requiredSkills.split(',').length > 4 && <span style={S.skill}>+{job.requiredSkills.split(',').length - 4}</span>}
              </div>
            )}
            <div style={S.cardFooter}>
              <button onClick={() => onSelectJob(job)} style={S.viewBtn}>
                View Candidates →
              </button>
              <button onClick={() => handleClose(job)} style={S.toggleBtn}>
                {job.status === 'OPEN' ? 'Close' : 'Reopen'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={S.empty}>
          {search ? `No jobs matching "${search}"` : 'No job postings yet. Create your first one!'}
        </div>
      )}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label}
      </label>
      <input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        required={required}
        style={{ width: '100%', padding: '9px 12px', background: '#08080f', border: '1.5px solid #1e1e35', borderRadius: 8, color: '#e8e8f8', fontSize: 14, fontFamily: 'inherit' }} />
    </div>
  );
}

const S = {
  page: { padding: '28px 32px', maxWidth: 1280, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800, color: '#e8e8f8', letterSpacing: '-0.5px', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#4a4a6a' },
  searchInput: { padding: '9px 14px', background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 8, color: '#e8e8f8', fontSize: 13, width: 200, fontFamily: 'inherit' },
  primaryBtn: { padding: '9px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  formCard: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 24, marginBottom: 20 },
  formTitle: { fontSize: 15, fontWeight: 700, color: '#e8e8f8', marginBottom: 20 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', background: '#08080f', border: '1.5px solid #1e1e35', borderRadius: 8, color: '#e8e8f8', fontSize: 14, fontFamily: 'inherit' },
  select: { width: '100%', padding: '9px 12px', background: '#08080f', border: '1.5px solid #1e1e35', borderRadius: 8, color: '#e8e8f8', fontSize: 14, fontFamily: 'inherit' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 20, cursor: 'default' },
  jobType: { fontSize: 10, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#1a1a2e', padding: '2px 8px', borderRadius: 4 },
  jobTitle: { fontSize: 16, fontWeight: 700, color: '#e8e8f8', marginBottom: 10, cursor: 'pointer', lineHeight: 1.3 },
  jobMeta: { display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#4a4a6a', marginBottom: 12 },
  skills: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  skill: { fontSize: 11, fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: 4 },
  cardFooter: { display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #1a1a2e' },
  viewBtn: { flex: 1, padding: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  toggleBtn: { padding: '8px 14px', background: 'transparent', border: '1px solid #1e1e35', borderRadius: 7, color: '#4a4a6a', cursor: 'pointer', fontSize: 12 },
  empty: { textAlign: 'center', padding: '60px 0', color: '#2a2a45', fontSize: 14 },
};
