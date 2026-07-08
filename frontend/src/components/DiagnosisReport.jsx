import { useState } from 'react';
import RiskGauge from './RiskGauge';
import FindingCard from './FindingCard';
import ExportButton from './ExportButton';
import TiltCard from './TiltCard';

const SEV_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const SEV_HEX = { Critical: '#dc2626', High: '#ef4444', Medium: '#f97316', Low: '#3b82f6' };

function NotesIcon() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(54,224,200,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <line x1="2" y1="3.5" x2="14" y2="3.5" stroke="#36e0c8" strokeWidth="1.4" />
        <line x1="2" y1="8" x2="14" y2="8" stroke="#36e0c8" strokeWidth="1.4" />
        <line x1="2" y1="12.5" x2="10" y2="12.5" stroke="#36e0c8" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

function StatusBadge({ report }) {
  const score = report.overall_risk_score ?? 0;
  const isClean = !report.findings || report.findings.length === 0;
  const count = report.findings?.length || 0;
  const color = isClean ? '#4be3a0' : score >= 66 ? '#ef4444' : score >= 33 ? '#f97316' : '#3b82f6';
  return (
    <span
      className="animate-stamp-in inline-flex items-center gap-2 rounded-full font-bold text-xs"
      style={{ padding: '7px 14px', color, background: `${color}1A`, border: `1px solid ${color}55` }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
      {isClean ? 'Patient healthy' : `${count} finding${count !== 1 ? 's' : ''} detected`}
    </span>
  );
}

function SeverityBreakdown({ findings }) {
  const counts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
  const order = ['Critical', 'High', 'Medium', 'Low'];
  const items = order.filter((sev) => counts[sev]);
  const total = findings.length;

  return (
    <TiltCard maxTilt={4} glowColor="rgba(54,224,200,0.10)">
      <div className="card card-glass p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="section-label" style={{ margin: 0 }}>Severity Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {items.map((sev) => (
              <span
                key={sev}
                className="sev-badge inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1"
                data-sev={sev.toLowerCase()}
                style={{ color: SEV_HEX[sev], background: `${SEV_HEX[sev]}1A`, border: `1px solid ${SEV_HEX[sev]}55` }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: SEV_HEX[sev] }} />
                {counts[sev]} {sev}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', height: 8, borderRadius: 6, overflow: 'hidden' }}>
          {items.map((sev) => (
            <div
              key={sev}
              className="sev-bar-seg"
              data-sev={sev.toLowerCase()}
              style={{ width: `${(counts[sev] / total) * 100}%`, background: SEV_HEX[sev] }}
            />
          ))}
        </div>
      </div>
    </TiltCard>
  );
}

function CreatePrCard({ report, githubMeta, githubToken, backend }) {
  const [prState, setPrState] = useState('idle');
  const [prResult, setPrResult] = useState(null);
  const [prError, setPrError] = useState(null);

  const handleCreatePr = async () => {
    setPrState('loading');
    setPrError(null);
    try {
      const res = await fetch(`${backend}/api/github/create-pr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          owner: githubMeta.owner,
          repo: githubMeta.repo,
          branch: githubMeta.branch,
          path: githubMeta.path,
          sha: githubMeta.sha,
          originalContent: githubMeta.originalContent,
          correctedContent: report.full_corrected_code,
          findings: report.findings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create pull request');
      setPrResult(data);
      setPrState('done');
    } catch (err) {
      setPrError(err.message);
      setPrState('error');
    }
  };

  return (
    <TiltCard maxTilt={5} glowColor="rgba(54,224,200,0.14)">
      <div className="card card-glass p-5">
        <p className="section-label">Operate — Apply Prescription</p>

        {prState === 'idle' && (
          <>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Open a pull request on <span className="font-mono text-slate-200">{githubMeta.owner}/{githubMeta.repo}</span> with the fixes that match the file exactly. Fixes whose snippet doesn't match the real file content won't be force-applied — they'll be listed in the PR description instead.
            </p>
            <button onClick={handleCreatePr} className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2">
              🔧 Create Pull Request with Fix
            </button>
          </>
        )}

        {prState === 'loading' && (
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="w-4 h-4 rounded-full border-2 border-med-green/30 border-t-med-green animate-spin" />
            Branching, committing, and opening the pull request…
          </div>
        )}

        {prState === 'done' && prResult && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✅</span>
              <p className="text-slate-200 text-sm">
                Pull request opened — <strong className="text-med-green">{prResult.appliedCount}</strong> fix{prResult.appliedCount !== 1 ? 'es' : ''} applied
                {prResult.skippedCount > 0 && (
                  <> · <strong className="text-sev-medium">{prResult.skippedCount}</strong> not auto-applied</>
                )}
              </p>
            </div>
            <a href={prResult.prUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2">
              View pull request →
            </a>
          </div>
        )}

        {prState === 'error' && (
          <div>
            <p className="text-sev-critical text-sm mb-3">{prError}</p>
            <button onClick={handleCreatePr} className="btn-ghost text-sm py-2.5 px-4">Try again</button>
          </div>
        )}
      </div>
    </TiltCard>
  );
}

function buildPrognosis(score, hasCritical) {
  if (hasCritical) {
    return 'High risk of exploitation. Immediate treatment of all critical conditions is advised before this codebase is cleared for production.';
  }
  if (score >= 50) {
    return 'Moderate risk overall. Several conditions should be treated before the next release.';
  }
  if (score > 0) {
    return 'Low overall risk, but the conditions found are still worth scheduling for treatment.';
  }
  return 'No conditions detected — the patient is healthy and clear for production.';
}

export default function DiagnosisReport({ report, onReset, truncationWarning, githubMeta, githubToken, backend, fileName }) {
  const isClean = !report.findings || report.findings.length === 0;
  const sortedFindings = [...(report.findings || [])].sort(
    (a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4)
  );
  const canOpenPr = !!githubMeta && !isClean;
  const hasCritical = sortedFindings.some((f) => f.severity === 'Critical');
  const score = report.overall_risk_score ?? 0;
  const tier = score >= 85 ? 'red' : score >= 66 ? 'orange' : score >= 33 ? 'yellow' : 'green';
  const tierColor = { red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e' }[tier];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const patientLabel = fileName || (githubMeta ? githubMeta.path : 'uploaded file');
  const commitLabel = githubMeta?.sha ? githubMeta.sha.slice(0, 7) : null;

  return (
    <div className="diagnosis-report animate-fade-up space-y-6" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
      <div className="print-only print-header">
        <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: 0 }}>DR. CODE — Security Diagnosis Report</h1>
        <p style={{ fontSize: '11pt', color: '#666', margin: '4pt 0 0' }}>
          Generated: {new Date().toLocaleString()} | Overall Risk Score: {report.overall_risk_score ?? 0}/100
        </p>
      </div>

      <div className="no-print" style={{ padding: '2rem 0 0.5rem' }}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: '#eef2f7', margin: 0 }}>
              Security Diagnosis Report
            </h1>
            <p className="font-mono" style={{ fontSize: 12.5, color: '#7a8699', marginTop: 4 }}>
              Generated {dateStr} · {timeStr} · patient: <span style={{ color: '#cdd6e4' }}>{patientLabel}</span>
              {commitLabel && <> · commit <span style={{ color: '#cdd6e4' }}>{commitLabel}</span></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton report={report} />
            <button onClick={onReset} className="btn-ghost text-sm py-2.5 px-4">New scan</button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <p className="section-label" style={{ margin: 0 }}>Diagnosis Report</p>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <StatusBadge report={report} />
        </div>
        {truncationWarning && (
          <span className="text-xs text-sev-medium border border-sev-medium/30 bg-sev-medium/8 rounded-full px-3 py-1 inline-block mt-2">
            ⚠️ File truncated to 50K chars
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TiltCard maxTilt={4} glowColor="rgba(54,224,200,0.08)">
          <div className="card card-glass p-5">
            <div className="flex items-center gap-2 mb-3">
              <NotesIcon />
              <p className="section-label" style={{ margin: 0 }}>Doctor&apos;s Notes</p>
            </div>
            {report.summary && (
              <p className="text-slate-200 leading-relaxed mb-3">{report.summary}</p>
            )}
            {report.root_cause_correlation && (
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{report.root_cause_correlation}</p>
            )}
            <div
              className="flex items-start gap-2 rounded-lg p-3"
              style={{ background: hasCritical ? 'rgba(220,38,38,0.08)' : 'rgba(75,227,160,0.08)', border: `1px solid ${hasCritical ? 'rgba(220,38,38,0.25)' : 'rgba(75,227,160,0.25)'}` }}
            >
              <span style={{ fontSize: 14 }}>{hasCritical ? '⚠️' : '✅'}</span>
              <p className="text-sm" style={{ color: hasCritical ? '#ff8a98' : '#8fe8bd', margin: 0 }}>
                <strong>Prognosis:</strong> {buildPrognosis(score, hasCritical)}
              </p>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={6} glowColor={`${tierColor}55`}>
          <div
            className="card card-glass risk-score-card p-6 flex flex-col items-center justify-center"
            data-tier={tier}
            style={{ border: `2px solid ${tierColor}`, boxShadow: `0 0 60px ${tierColor}55, 0 0 18px ${tierColor}66` }}
          >
            <p className="section-label" style={{ margin: '0 0 8px' }}>Overall Risk Score</p>
            <RiskGauge score={score} />
          </div>
        </TiltCard>
      </div>

      {isClean && (
        <TiltCard maxTilt={5} glowColor="rgba(0,255,157,0.12)">
          <div className="card card-glass p-10 text-center border-med-green/20 bg-med-green/5">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute w-24 h-24 rounded-full border border-med-green/30 animate-pulse-ring" />
              <span className="text-5xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-med-green mb-2 text-glow-green">Patient Healthy!</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Dr. Code found no security vulnerabilities in this file. The patient appears to be in good health.
            </p>
          </div>
        </TiltCard>
      )}

      {sortedFindings.length > 0 && (
        <SeverityBreakdown findings={sortedFindings} />
      )}

      {canOpenPr && (
        <CreatePrCard report={report} githubMeta={githubMeta} githubToken={githubToken} backend={backend} />
      )}

      {sortedFindings.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: '#eef2f7', margin: '0 0 4px' }}>
            Detected conditions
          </h2>
          <p className="font-mono text-xs" style={{ color: '#7a8699', marginBottom: 16 }}>
            {sortedFindings.length} finding{sortedFindings.length !== 1 ? 's' : ''} · sorted by severity
          </p>
          <div className="space-y-3">
            {sortedFindings.map((finding, i) => (
              <FindingCard key={`${finding.title}-${i}`} finding={finding} index={i} fileName={patientLabel} />
            ))}
          </div>
        </div>
      )}

      {report.full_corrected_code && (
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: '#eef2f7', margin: '0 0 4px' }}>
            Complete Treatment — Suggested Full Fix
          </h2>
          <p className="font-mono text-xs" style={{ color: '#7a8699', marginBottom: 12 }}>
            Full file content with matching prescriptions applied, verified by a second independent AI pass
          </p>
          <div className="card card-glass p-5">
            <pre
              className="corrected-code-block text-xs font-mono overflow-x-auto"
              style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#cdd6e4' }}
            >
              {report.full_corrected_code}
            </pre>
          </div>
        </div>
      )}

      <div className="no-print pt-4 border-t border-navy-border flex flex-col sm:flex-row gap-3 justify-between items-center">
        <p className="text-xs text-slate-600">
          Dr. Code analysis
        </p>
        <div className="flex gap-2">
          <ExportButton report={report} />
          <button onClick={onReset} className="btn-ghost text-sm py-2.5 px-4">🩺 New Scan</button>
        </div>
      </div>
    </div>
  );
}