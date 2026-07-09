const RUNGS = 22;
const RADIUS = 86;
const GAP = 16;

const rungs = Array.from({ length: RUNGS }, (_, i) => ({
  key: i,
  y: (i - (RUNGS - 1) / 2) * GAP,
  angle: i * 33,
}));

function Helix() {
  return (
    <div className="hero-helix" style={{ position: 'absolute', left: '50%', top: '48%', transform: 'translate(-50%,-50%)', width: 300, height: 420, perspective: 1000 }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d', animation: 'drc-spin 9s linear infinite' }}>
        {rungs.map((r) => (
          <div
            key={r.key}
            style={{ position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `translateY(${r.y}px) rotateY(${r.angle}deg)` }}
          >
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: RADIUS * 2, height: 2, transform: 'translate(-50%,-50%)', background: 'linear-gradient(90deg,rgba(54,224,200,0.08),rgba(75,227,160,0.5),rgba(76,141,255,0.08))' }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: 13, height: 13, borderRadius: '50%', background: '#36e0c8', transform: `translate(-50%,-50%) translateX(-${RADIUS}px)`, boxShadow: '0 0 16px #36e0c8' }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: 13, height: 13, borderRadius: '50%', background: '#4be3a0', transform: `translate(-50%,-50%) translateX(${RADIUS}px)`, boxShadow: '0 0 16px #4be3a0' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero({ onStartDiagnosis }) {
  const handleStart = () => {
    if (onStartDiagnosis) {
      onStartDiagnosis();
    } else {
      document.getElementById('checkin')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#06070e', color: '#eef2f7', fontFamily: "'IBM Plex Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes drc-spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        @keyframes drc-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes drc-ekg { from { transform: translateX(0); } to { transform: translateX(-100px); } }
        @keyframes drc-pulse-dot { 0%, 100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }

        /* ── Mobile overrides — desktop styles above are untouched ── */
        @media (max-width: 860px) {
          .hero-nav {
            padding: 12px 18px !important;
          }
          .hero-nav-brand-text {
            font-size: 17px !important;
          }
          .hero-nav-cta {
            padding: 9px 15px !important;
            font-size: 13px !important;
          }
          .hero-section {
            grid-template-columns: 1fr !important;
            padding: 84px 20px 48px !important;
            min-height: auto !important;
            gap: 8px !important;
          }
          .hero-heading {
            font-size: 34px !important;
            line-height: 1.14 !important;
            margin: 0 0 16px !important;
          }
          .hero-para {
            font-size: 14.5px !important;
            max-width: 100% !important;
            margin: 0 0 26px !important;
          }
          .hero-visual {
            height: 380px !important;
            margin-top: 4px !important;
          }
          .hero-helix {
            transform: translate(-50%,-50%) scale(0.68) !important;
          }
          .hero-badge {
            padding: 8px 11px !important;
            border-radius: 11px !important;
          }
          .hero-badge-icon {
            width: 24px !important;
            height: 24px !important;
            font-size: 13px !important;
            border-radius: 7px !important;
          }
          .hero-badge-title {
            font-size: 11.5px !important;
          }
          .hero-badge-sub {
            font-size: 10px !important;
          }
          .hero-badge-bug {
            top: 2% !important;
            right: 0% !important;
          }
          .hero-badge-health {
            bottom: 24% !important;
            left: 0% !important;
          }
          .hero-vitals-card {
            width: 86% !important;
            max-width: 260px !important;
          }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(680px 620px at 78% 14%, rgba(54,224,200,0.13), transparent 60%), radial-gradient(720px 520px at 12% 72%, rgba(76,141,255,0.11), transparent 62%), radial-gradient(500px 500px at 50% 120%, rgba(75,227,160,0.08), transparent 60%)' }} />

      <nav className="hero-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', backdropFilter: 'blur(16px)', background: 'linear-gradient(180deg, rgba(6,7,14,0.86), rgba(6,7,14,0.3))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#36e0c8,#4c8dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(54,224,200,0.4)', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 15, height: 4.5, borderRadius: 2, background: '#06070e' }} />
            <div style={{ position: 'absolute', width: 4.5, height: 15, borderRadius: 2, background: '#06070e' }} />
          </div>
          <span className="hero-nav-brand-text" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>Dr.Code</span>
        </div>
        <button onClick={handleStart} className="hero-nav-cta" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14.5, fontWeight: 600, color: '#06070e', border: 'none', cursor: 'pointer', padding: '11px 20px', borderRadius: 11, background: 'linear-gradient(135deg,#36e0c8,#4be3a0)', boxShadow: '0 8px 24px rgba(54,224,200,0.3)' }}>
          Start diagnosis
        </button>
      </nav>

      <section className="hero-section" style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', alignItems: 'center', gap: 40, maxWidth: 1280, margin: '0 auto', padding: '100px 48px 80px', minHeight: '100vh' }}>
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 16px', borderRadius: 100, background: 'rgba(54,224,200,0.1)', border: '1px solid rgba(54,224,200,0.25)', fontSize: 12.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#36e0c8', fontWeight: 600, marginBottom: 26 }}>
            <span style={{ position: 'relative', width: 17, height: 9, display: 'inline-block', flexShrink: 0 }}>
              <span style={{ position: 'absolute', left: 0, top: 1, width: 7, height: 7, borderRadius: '50%', background: '#4be3a0', boxShadow: '0 0 10px #4be3a0', animation: 'drc-pulse-dot 1.8s ease-in-out infinite' }} />
              <span style={{ position: 'absolute', left: 9, top: 1, width: 7, height: 7, borderRadius: '50%', background: '#4c8dff', boxShadow: '0 0 10px #4c8dff', animation: 'drc-pulse-dot 1.8s ease-in-out infinite 0.5s' }} />
            </span>
            Double AI Verification
          </div>
          <h1 className="hero-heading" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.03em', margin: '0 0 22px' }}>
            Your code has a pulse.<br />
            <span style={{ background: 'linear-gradient(120deg,#36e0c8,#4be3a0,#4c8dff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Dr.Code keeps it healthy.</span>
          </h1>
          <p className="hero-para" style={{ fontSize: 18, lineHeight: 1.6, color: '#9aa7bd', maxWidth: 500, margin: '0 0 34px' }}>
            Upload a file — or just a screenshot of the error. Dr.Code diagnoses the bug with two independent AI reviews, prescribes the exact fix, and gets your codebase back to full health in seconds.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={handleStart} style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, fontWeight: 600, color: '#06070e', border: 'none', cursor: 'pointer', padding: '15px 28px', borderRadius: 13, background: 'linear-gradient(135deg,#36e0c8,#4be3a0)', boxShadow: '0 12px 34px rgba(54,224,200,0.34)', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              Start diagnosis →
            </button>
          </div>
        </div>

        <div className="hero-visual" style={{ position: 'relative', height: 540 }}>
          <div style={{ position: 'absolute', inset: 0, margin: 'auto', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(54,224,200,0.18), transparent 65%)', filter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', left: '50%', top: '48%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', left: '50%', top: '48%', transform: 'translate(-50%,-50%)', width: 200, height: 200, borderRadius: '50%', border: '1px dashed rgba(54,224,200,0.18)' }} />

          <Helix />

          <div className="hero-badge-bug" style={{ position: 'absolute', top: '8%', right: '2%', animation: 'drc-float 5.5s ease-in-out infinite' }}>
            <div className="hero-badge" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 15px', borderRadius: 14, background: 'linear-gradient(160deg, rgba(255,90,110,0.16), rgba(255,255,255,0.03))', border: '1px solid rgba(255,90,110,0.32)', backdropFilter: 'blur(14px)', boxShadow: '0 14px 40px rgba(0,0,0,0.4)' }}>
              <div className="hero-badge-icon" style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,90,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff5a6e', fontSize: 16, fontWeight: 700 }}>!</div>
              <div>
                <div className="hero-badge-title" style={{ fontSize: 13.5, fontWeight: 600 }}>2 bugs found</div>
                <div className="hero-badge-sub" style={{ fontSize: 11.5, color: '#9aa7bd' }}>auth-service.js</div>
              </div>
            </div>
          </div>

          <div className="hero-badge-health" style={{ position: 'absolute', bottom: '14%', left: '-4%', animation: 'drc-float 6.5s ease-in-out infinite 0.6s' }}>
            <div className="hero-badge" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 15px', borderRadius: 14, background: 'linear-gradient(160deg, rgba(75,227,160,0.16), rgba(255,255,255,0.03))', border: '1px solid rgba(75,227,160,0.34)', backdropFilter: 'blur(14px)', boxShadow: '0 14px 40px rgba(0,0,0,0.4)' }}>
              <div className="hero-badge-icon" style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(75,227,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4be3a0', fontSize: 15, fontWeight: 700 }}>✓</div>
              <div>
                <div className="hero-badge-title" style={{ fontSize: 13.5, fontWeight: 600 }}>Health 98%</div>
                <div className="hero-badge-sub" style={{ fontSize: 11.5, color: '#9aa7bd' }}>prescription applied</div>
              </div>
            </div>
          </div>

          <div className="hero-vitals-card" style={{ position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)', width: 280 }}>
            <div style={{ padding: '12px 14px 8px', borderRadius: 16, background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(14px)', boxShadow: '0 14px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: '#9aa7bd', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>Live vitals</span>
                <span style={{ color: '#4be3a0' }}>● 72 bpm</span>
              </div>
              <svg viewBox="0 0 600 60" width="100%" height="46" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <g style={{ animation: 'drc-ekg 2.4s linear infinite' }}>
                  <polyline
                    points="0,30 30,30 38,30 44,16 50,42 56,6 62,52 70,30 100,30 130,30 138,30 144,16 150,42 156,6 162,52 170,30 200,30 230,30 238,30 244,16 250,42 256,6 262,52 270,30 300,30 330,30 338,30 344,16 350,42 356,6 362,52 370,30 400,30 430,30 438,30 444,16 450,42 456,6 462,52 470,30 500,30 530,30 538,30 544,16 550,42 556,6 562,52 570,30 600,30 630,30 638,30 644,16 650,42 656,6 662,52 670,30 700,30"
                    fill="none"
                    stroke="#4be3a0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(75,227,160,0.8))' }}
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}