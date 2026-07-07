export default function RejectionModal({ reason, onReset }) {
  return (
    <div className="max-w-md mx-auto text-center animate-fade-up">
      {/* Pulsing icon */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute w-28 h-28 rounded-full border border-amber-500/25 animate-pulse-ring" />
        <div className="absolute w-24 h-24 rounded-full border border-amber-500/15 animate-pulse-ring" style={{ animationDelay: '0.6s' }} />
        <div className="relative w-20 h-20 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center animate-rejection-pulse">
          <span className="text-4xl select-none" role="img" aria-label="Confused stethoscope">
            🩺
          </span>
        </div>
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
        Dr. Code couldn&apos;t find a diagnosis
        <br />
        <span className="text-amber-400">in this image</span>
      </h2>

      {/* Dynamic rejection reason */}
      <div className="card p-4 mb-6 border-amber-500/20 bg-amber-950/20">
        <p className="text-slate-300 text-sm leading-relaxed">
          {reason
            ? <>
                <span className="text-amber-400 font-medium">Reason: </span>
                {reason.charAt(0).toUpperCase() + reason.slice(1)}.
              </>
            : 'No code symptoms detected in this image.'
          }
        </p>
        <p className="text-slate-500 text-xs mt-2">
          Please upload a clearer screenshot of source code, or drop the actual source file for an accurate diagnosis.
        </p>
      </div>

      {/* Accepted hint */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs text-slate-500">
        {['Python', 'JavaScript', 'Java', 'C/C++', 'Log files', 'APKs'].map((t) => (
          <span key={t} className="px-2.5 py-1 rounded-full border border-navy-border bg-navy-card">
            {t}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onReset}
        className="btn-primary w-full text-base"
      >
        Try Another Upload
      </button>
    </div>
  );
}
