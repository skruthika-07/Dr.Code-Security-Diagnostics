function ECGLine() {
  return (
    <div className="w-full h-10 mt-1">
      <svg viewBox="0 0 1000 70" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="headerEcgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#36e0c8" />
            <stop offset="50%" stopColor="#4be3a0" />
            <stop offset="100%" stopColor="#4c8dff" />
          </linearGradient>
        </defs>
        <path
          className="ecg-draw-path"
          pathLength="1000"
          d="M0,35 L150,35 L165,28 L180,35 L300,35 L315,20 L330,35
             L450,35 L465,12 L480,58 L495,35 L600,35
             L615,25 L630,35 L750,35 L765,15 L780,35 L1000,35"
          fill="none"
          stroke="url(#headerEcgGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Header() {
  return (
    <header
      className="no-print relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(20,24,36,0.92), rgba(10,12,22,0.88))', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
    >
      <div className="relative z-10 flex items-center justify-between px-5 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#36e0c8,#4c8dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(54,224,200,0.4)', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 15, height: 4.5, borderRadius: 2, background: '#06070e' }} />
            <div style={{ position: 'absolute', width: 4.5, height: 15, borderRadius: 2, background: '#06070e' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider leading-none" style={{ color: '#eef2f7' }}>
              Dr.{' '}
              <span style={{ background: 'linear-gradient(120deg,#36e0c8,#4be3a0,#4c8dff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                Code
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase mt-0.5" style={{ color: '#7a8699' }}>
              Security Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs select-none" style={{ color: '#7a8699' }}>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-heartbeat" style={{ background: '#4be3a0' }} />
            Systems Online
          </span>
          <span className="hidden md:block font-mono" style={{ color: '#3a4255' }}>v1.0</span>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-1 -mt-3 max-w-7xl mx-auto">
        <ECGLine />
      </div>
    </header>
  );
}