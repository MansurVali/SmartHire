import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import PipelinePage from './pages/PipelinePage';
import LiveScreenPage from './pages/LiveScreenPage';
import Sidebar from './components/Sidebar';

export default function App() {
  const { token } = useSelector(s => s.auth);
  const [view, setView] = useState('dashboard');
  const [pipelineJob, setPipelineJob] = useState(null);

  if (!token) return <LoginPage />;

  const handleJobClick = (job) => {
    setPipelineJob(job);
    setView('pipeline');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08080f' }}>
      <Sidebar view={view} setView={(v) => { setView(v); if (v !== 'pipeline') setPipelineJob(null); }} />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {view === 'dashboard' && <DashboardPage onJobClick={handleJobClick} />}
        {view === 'jobs'      && <JobsPage onSelectJob={handleJobClick} />}
        {view === 'pipeline'  && <PipelinePage initialJob={pipelineJob} />}
        {view === 'screen'    && <LiveScreenPage />}
      </main>
    </div>
  );
}
