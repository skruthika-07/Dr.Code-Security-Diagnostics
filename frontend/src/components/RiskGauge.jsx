import { useState, useEffect } from 'react';

function scoreColor(score) {
  if (score >= 85) return '#ef4444';
  if (score >= 66) return '#f97316';
  if (score >= 33) return '#eab308';
  return '#22c55e';
}

function scoreTier(score) {
  if (score >= 85) return 'red';
  if (score >= 66) return 'orange';
  if (score >= 33) return 'yellow';
  return 'green';
}

function scoreLabel(score) {
  if (score >= 85) return 'Critical condition';
  if (score >= 66) return 'High risk condition';
  if (score >= 33) return 'Moderate risk';
  if (score > 0) return 'Low risk';
  return 'Minimal risk';
}

// Build the dome as a series of straight segments between points computed
// directly on the circle — no SVG arc command, no sweep/large-arc flags,
// so there is no direction to get backwards. theta sweeps from 180deg
// (left point) down to 0deg (right point), passing through 90deg (top).
function buildDomePath(cx, cy, r, segments = 64) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = Math.PI * (1 - i / segments);
    const x = cx + r * Math.cos(theta);
    const y = cy - r * Math.sin(theta);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

const ARC_PATH = buildDomePath(150, 145, 110);

export default function RiskGauge({ score = 0 }) {
  const clamped = Math.max(0, Math.min(100, score));
  const finalRotation = -90 + clamped * 1.8;
  const [rotation, setRotation] = useState(-90);

  useEffect(() => {
    const t = setTimeout(() => setRotation(finalRotation), 150);
    return () => clearTimeout(t);
  }, [finalRotation]);

  const color = scoreColor(clamped);
  const tier = scoreTier(clamped);

  return (
    <div className="risk-gauge-wrap flex flex-col items-center select-none" style={{ width: '100%' }}>
      <div style={{ width: '100%', maxWidth: 300 }}>
        <svg
          viewBox="0 0 300 170"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label={`Risk gauge: ${clamped} out of 100`}
        >
          <defs>
            <linearGradient id="riskGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="33%" stopColor="#eab308" />
              <stop offset="66%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <path d={ARC_PATH} stroke="#1e3a5f" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ARC_PATH} stroke="url(#riskGaugeGrad)" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {[
            { label: '0', x: 28, y: 148 },
            { label: '50', x: 147, y: 22 },
            { label: '100', x: 260, y: 148 },
          ].map(({ label, x, y }) => (
            <text key={label} x={x} y={y} fontSize="10" fill="#7a8699" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
              {label}
            </text>
          ))}

          <g
            transform={`rotate(${rotation} 150 145)`}
            style={{ transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <line x1="150" y1="145" x2="150" y2="50" stroke="rgba(0,0,0,0.4)" strokeWidth="5" strokeLinecap="round" />
            <line
              x1="150" y1="145" x2="150" y2="50"
              stroke={color} strokeWidth="3" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </g>
          <circle cx="150" cy="145" r="7" fill={color} opacity="0.9" />
          <circle cx="150" cy="145" r="4" fill="#0a0f1e" />
        </svg>
      </div>

      <div className="mt-1 text-center">
        <p className="risk-score-number font-mono" data-tier={tier} style={{ fontSize: 44, fontWeight: 700, color, lineHeight: 1 }}>
          {clamped}
          <span style={{ fontSize: 18, color: '#7a8699', fontWeight: 500 }}>/100</span>
        </p>
        <span
          className="risk-status-pill inline-block mt-2 font-semibold"
          data-tier={tier}
          style={{ fontSize: 12, padding: '5px 14px', borderRadius: 100, color, background: `${color}1A`, border: `1px solid ${color}55` }}
        >
          {scoreLabel(clamped)}
        </span>
      </div>
    </div>
  );
}