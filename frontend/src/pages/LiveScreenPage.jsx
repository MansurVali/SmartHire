import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addEvent } from '../store';

export default function LiveScreenPage() {
  const dispatch = useDispatch();
  const { events } = useSelector(s => s.screening);
  const { user } = useSelector(s => s.auth);
  const feedRef = useRef(null);

  // WebSocket via SockJS + STOMP would connect here
  // Using polling on /api/candidates as fallback when STOMP not available
  useEffect(() => {
    let stompClient = null;

    const connectWs = async () => {
      try {
        const [SockJS, { Client }] = await Promise.all([
          import('sockjs-client').then(m => m.default),
          import('@stomp/stompjs'),
        ]);
        stompClient = new Client({
          webSocketFactory: () => new SockJS('/ws'),
          onConnect: () => {
            stompClient.subscribe(`/topic/screening/${user.tenantId}`, (msg) => {
              try {
                const data = JSON.parse(msg.body);
                dispatch(addEvent(data));
              } catch {}
            });
          },
          onStompError: () => {},
        });
        stompClient.activate();
      } catch (e) {
        console.log('WebSocket not available, using polling');
      }
    };

    connectWs();
    return () => { if (stompClient) stompClient.deactivate(); };
  }, [user?.tenantId, dispatch]);

  const getEventDisplay = (ev) => {
    if (ev.event === 'SCORING_COMPLETE') return {
      icon: '🤖',
      text: `${ev.name} scored ${ev.score}/100 · Skills: ${ev.skillMatchPct}%`,
      badge: ev.recommendation,
      color: ev.recommendation === 'SHORTLIST' ? '#10b981' : ev.recommendation === 'HOLD' ? '#f59e0b' : '#f43f5e',
    };
    if (ev.event === 'SCREENING_STARTED') return { icon: '⏳', text: `Screening ${ev.name}...`, badge: 'AI', color: '#f59e0b' };
    if (ev.event === 'SCORING_FAILED')    return { icon: '❌', text: `Scoring failed for candidate #${ev.candidateId}`, badge: 'ERROR', color: '#f43f5e' };
    return { icon: '📋', text: ev.msg || JSON.stringify(ev), badge: null, color: '#9898b8' };
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>
            <span style={S.liveDot} />
            Live AI Screening
          </h1>
          <p style={S.subtitle}>Real-time WebSocket feed of AI scoring events for {user?.companyName}</p>
        </div>
        <div style={S.counter}>{events.length} events</div>
      </div>

      {/* Info cards */}
      <div style={S.infoGrid}>
        {[
          { icon: '📡', title: 'WebSocket (STOMP)', desc: 'Connects to /topic/screening/{tenantId}' },
          { icon: '🤖', title: 'Async AI Pipeline', desc: 'Spring @Async + Claude API scoring' },
          { icon: '🏗️', title: 'Tenant Isolated', desc: 'Events scoped to your company only' },
          { icon: '⚡', title: 'Real-time Push', desc: 'No polling — instant broadcast on completion' },
        ].map(card => (
          <div key={card.title} style={S.infoCard}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c8c8e8', marginBottom: 4 }}>{card.title}</div>
            <div style={{ fontSize: 11, color: '#4a4a6a' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Terminal feed */}
      <div style={S.terminal} ref={feedRef}>
        <div style={S.terminalHeader}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ ...S.dot, background: '#f43f5e' }} />
            <span style={{ ...S.dot, background: '#f59e0b' }} />
            <span style={{ ...S.dot, background: '#10b981' }} />
          </div>
          <span style={S.termTitle}>smarthire/screening/{user?.tenantId}</span>
          <span style={{ ...S.livePill, animation: 'pulse-dot 1.5s infinite' }}>● LIVE</span>
        </div>

        <div style={S.terminalBody}>
          {events.length === 0 ? (
            <div style={S.emptyTerm}>
              <div style={{ marginBottom: 8, opacity: 0.4 }}>{'>'}_</div>
              <div>Waiting for screening events...</div>
              <div style={{ marginTop: 12, fontSize: 11, opacity: 0.5 }}>
                Go to Jobs → select a job → Submit Candidate to trigger AI scoring
              </div>
            </div>
          ) : events.map((ev, i) => {
            const { icon, text, badge, color } = getEventDisplay(ev);
            return (
              <div key={ev.id} style={S.termLine} className={i === 0 ? 'fade-in' : ''}>
                <span style={S.termTime}>{new Date(ev.id).toLocaleTimeString()}</span>
                <span style={{ color, marginRight: 6 }}>{icon}</span>
                <span style={S.termText}>{text}</span>
                {badge && (
                  <span style={{ ...S.termBadge, color, borderColor: color + '44', background: color + '11' }}>
                    {badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div style={S.howItWorks}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          How the AI Pipeline Works
        </h3>
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {[
            ['1', 'Candidate Submit', 'Resume text POSTed to /api/candidates'],
            ['2', 'Status → AI_SCREENING', '@Async triggerAiScoring() fires'],
            ['3', 'Claude API Call', 'Resume + JD sent to claude-sonnet-4'],
            ['4', 'Structured JSON', 'Score, skills, strengths, gaps, bias flags'],
            ['5', 'DB Updated', 'Candidate record enriched with AI data'],
            ['6', 'WebSocket Broadcast', '/topic/screening/{tenantId} notified'],
          ].map(([n, title, desc], i, arr) => (
            <React.Fragment key={n}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={S.stepNum}>{n}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#c8c8e8', margin: '8px 0 4px' }}>{title}</div>
                <div style={{ fontSize: 11, color: '#4a4a6a' }}>{desc}</div>
              </div>
              {i < arr.length - 1 && <div style={S.stepArrow}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { padding: '28px 32px', maxWidth: 1280, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800, color: '#e8e8f8', letterSpacing: '-0.5px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 },
  liveDot: { display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981', animation: 'pulse-dot 1.5s infinite' },
  subtitle: { fontSize: 13, color: '#4a4a6a' },
  counter: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 8, padding: '7px 14px', fontSize: 13, color: '#4a4a6a' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  infoCard: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 10, padding: 16 },
  terminal: { background: '#030308', border: '1px solid #1e1e35', borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  terminalHeader: { background: '#0a0a14', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1e1e35' },
  dot: { display: 'inline-block', width: 10, height: 10, borderRadius: '50%' },
  termTitle: { flex: 1, fontSize: 11, color: '#2a2a45', fontFamily: 'JetBrains Mono, monospace' },
  livePill: { fontSize: 10, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em' },
  terminalBody: { padding: 20, minHeight: 300, maxHeight: 460, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace' },
  emptyTerm: { color: '#2a2a45', fontSize: 13, textAlign: 'center', padding: '60px 0' },
  termLine: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #0a0a14', fontSize: 13 },
  termTime: { fontSize: 10, color: '#2a2a45', whiteSpace: 'nowrap' },
  termText: { color: '#8888a8', flex: 1 },
  termBadge: { fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, border: '1px solid', textTransform: 'uppercase', letterSpacing: '0.08em' },
  howItWorks: { background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 14, padding: 24 },
  stepNum: { width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, margin: '0 auto' },
  stepArrow: { color: '#1e1e35', fontSize: 18, flexShrink: 0 },
};
