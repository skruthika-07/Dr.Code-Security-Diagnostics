const SEV_MAP = {
  Critical: { label: 'Critical', hex: '#dc2626', glow: '0 0 24px rgba(220,38,38,0.18)' },
  High: { label: 'High', hex: '#ef4444', glow: '0 0 24px rgba(239,68,68,0.16)' },
  Medium: { label: 'Medium', hex: '#f97316', glow: '0 0 24px rgba(249,115,22,0.14)' },
  Low: { label: 'Low', hex: '#3b82f6', glow: '0 0 24px rgba(59,130,246,0.14)' },
};

const CONF_HEX = { High: '#ef4444', Medium: '#f97316', Low: '#3b82f6' };

function DescIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
      <line x1="1" y1="3" x2="15" y2="3" stroke="#36e0c8" strokeWidth="1.4" />
      <line x1="1" y1="8" x2="15" y2="8" stroke="#36e0c8" strokeWidth="1.4" />
      <line x1="1" y1="13" x2="11" y2="13" stroke="#36e0c8" strokeWidth="1.4" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
      <path d="M8 1.5 L15 14.5 H1 Z" stroke="#ff6b35" strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="8" y1="6" x2="8" y2="9.5" stroke="#ff6b35" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.7" r="0.8" fill="#ff6b35" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
      <line x1="8" y1="1.5" x2="8" y2="14.5" stroke="#4be3a0" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#4be3a0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Lightweight fallback formatter: if the AI returned a fix as one flat line
// (no real newlines), reflow it using brace/semicolon boundaries so it reads
// like real, indented code instead of one cramped line. If the string already
// has real line breaks, it's trusted as-is and left untouched.
function formatCode(code) {
  if (!code) return '';
  const newlineCount = (code.match(/\n/g) || []).length;
  if (newlineCount >= 2) return code;

  let result = '';
  let depth = 0;
  let line = '';
  const indent = () => '  '.repeat(depth);
  const pushLine = () => {
    if (line.trim()) {
      result += indent() + line.trim() + '\n';
    }
    line = '';
  };
  for (const ch of code) {
    if (ch === '{') {
      line += ' {';
      pushLine();
      depth++;
    } else if (ch === '}') {
      pushLine();
      depth = Math.max(0, depth - 1);
      line = '}';
      pushLine();
    } else if (ch === ';') {
      line += ';';
      pushLine();
    } else {
      line += ch;
    }
  }
  pushLine();
  return result.trim();
}

function DiffBlock({ code, variant }) {
  if (!code) return null;
  const isBefore = variant === 'before';
  const lines = formatCode(code).split('\n');
  return (
    <pre
      className="text-xs font-mono overflow-x-auto"
      style={{
        margin: 0,
        padding: '10px 14px',
        borderRadius: 10,
        background: isBefore ? 'rgba(220,38,38,0.08)' : 'rgba(75,227,160,0.08)',
        borderLeft: `3px solid ${isBefore ? '#dc2626' : '#4be3a0'}`,
        color: isBefore ? '#ff8a98' : '#8fe8bd',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6,
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          <span style={{ opacity: 0.7, marginRight: 8 }}>{isBefore ? '-' : '+'}</span>
          {line || ' '}
        </div>
      ))}
    </pre>
  );
}

export default function FindingCard({ finding, index, fileName }) {
  const s = SEV_MAP[finding.severity] || SEV_MAP.Low;
  const sevKey = (finding.severity || 'low').toLowerCase();

  return (
    <div
      className="finding-card rounded-xl border border-white/5 overflow-hidden animate-fade-up card-hover card-glass"
      data-sev={sevKey}
      style={{
        animationDelay: `${index * 60}ms`,
        borderLeftWidth: 4,
        borderLeftColor: s.hex,
        boxShadow: s.glow,
      }}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs" style={{ color: '#5a6478' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="sev-badge text-xs font-bold uppercase rounded-full px-3 py-1"
              data-sev={sevKey}
              style={{ background: s.hex, color: '#06070e', letterSpacing: '0.04em' }}
            >
              {s.label}
            </span>
          </div>
          <span className="text-xs font-mono font-bold" style={{ color: s.hex }}>
            CVSS {finding.cvss_score?.toFixed(1)}
          </span>
        </div>

        <h3 className="font-bold text-slate-100" style={{ fontSize: 16, marginBottom: 4 }}>
          {finding.title}
        </h3>
        {finding.affected_line && (
          <p className="text-xs text-slate-500 font-mono mb-4">
            {fileName ? `${fileName} : ${finding.affected_line}` : finding.affected_line}
          </p>
        )}

        {finding.exploitability_confidence && (
          <p className="text-xs mb-4" style={{ color: CONF_HEX[finding.exploitability_confidence] || '#7a8699' }}>
            {finding.exploitability_confidence} exploitability confidence
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          {finding.description && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <DescIcon />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#36e0c8' }}>Description</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{finding.description}</p>
            </div>
          )}
          {finding.attack_narrative && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <WarnIcon />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ff6b35' }}>Attack Narrative</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{finding.attack_narrative}</p>
            </div>
          )}
        </div>

        {(finding.remediation_diff?.before || finding.remediation_diff?.after) && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <PlusIcon />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#4be3a0' }}>Prescription</span>
            </div>
            <div className="flex flex-col gap-2">
              <DiffBlock code={finding.remediation_diff.before} variant="before" />
              <DiffBlock code={finding.remediation_diff.after} variant="after" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}