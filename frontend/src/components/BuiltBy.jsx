import React from 'react';

/**
 * Attribution component — shown in sidebar footer on every page.
 * The HTML fallback in index.html is hidden when this renders.
 */
export default function BuiltBy({ collapsed = false }) {
  return (
    <div
      id="smarthire-built-by"
      style={{
        padding: collapsed ? '12px 0' : '14px 20px',
        borderTop: '1px solid #1e1e35',
        background: '#08080f',
        textAlign: collapsed ? 'center' : 'left',
      }}
    >
      {collapsed ? (
        <a
          href="https://github.com/Gangalovaraju"
          target="_blank"
          rel="noopener noreferrer"
          title="Built by Ganga Lova Raju"
          style={{ fontSize: 18, textDecoration: 'none' }}
        >
          👤
        </a>
      ) : (
        <>
          <div style={{ fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Built by
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9898b8', marginBottom: 4 }}>
            Ganga Lova Raju
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <a
              href="https://github.com/Gangalovaraju"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              <GithubIcon /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/gangalovaraju"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              <LinkedInIcon /> LinkedIn
            </a>
          </div>
        </>
      )}
    </div>
  );
}

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
  color: '#6366f1',
  textDecoration: 'none',
  fontWeight: 600,
};

function GithubIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
