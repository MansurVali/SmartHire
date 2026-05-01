import React, { useEffect, useRef } from 'react';

export default function ScoreRing({ score, size = 80, strokeWidth = 6 }) {
  const circleRef = useRef(null);
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Good' : 'Weak';

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.transition = 'none';
    circleRef.current.style.strokeDashoffset = circ;
    requestAnimationFrame(() => {
      circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
      circleRef.current.style.strokeDashoffset = offset;
    });
  }, [score, circ, offset]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#1e1e35" strokeWidth={strokeWidth} />
        <circle ref={circleRef} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          transform={`rotate(90, ${size/2}, ${size/2})`}
          fill={color} fontSize={size * 0.22} fontWeight="800"
          fontFamily="'Plus Jakarta Sans', sans-serif">
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
    </div>
  );
}
