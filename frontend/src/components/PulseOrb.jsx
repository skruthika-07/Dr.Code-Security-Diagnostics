export default function PulseOrb({ progress = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, progress));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className={`relative w-40 h-40 sm:w-48 sm:h-48 mx-auto ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-heartbeat"
        style={{ filter: 'drop-shadow(0 0 20px rgba(54,224,200,0.45))' }}
      >
        <defs>
          <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#36e0c8" />
            <stop offset="55%" stopColor="#4be3a0" />
            <stop offset="100%" stopColor="#4c8dff" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill="rgba(75,227,160,0.08)" stroke="url(#orbGrad)" strokeWidth="1" opacity="0.6" />
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const r = 22 + (i % 3) * 4;
          const x = 50 + Math.cos(angle) * r;
          const y = 50 + Math.sin(angle) * r;
          const colors = ['#36e0c8', '#4be3a0', '#4c8dff'];
          return <circle key={i} cx={x} cy={y} r="1.3" fill={colors[i % 3]} opacity={0.5 + (i % 3) * 0.15} />;
        })}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e3a5f" strokeWidth="3" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="url(#orbGrad)"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-2xl sm:text-3xl font-bold font-mono"
          style={{ background: 'linear-gradient(120deg,#36e0c8,#4be3a0,#4c8dff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
        >
          {Math.round(clamped)}%
        </span>
      </div>
    </div>
  );
}