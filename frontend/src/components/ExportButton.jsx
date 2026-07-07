import { useState, useRef, useEffect } from 'react';

const SEV_MEDICAL = {
  Critical: 'Life Threatening',
  High: 'Serious Condition',
  Medium: 'Needs Attention',
  Low: 'Minor Symptom',
};

function exportJSON(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dr-code-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerPrint() {
  window.print();
}

export default function ExportButton({ report }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="no-print relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-navy-card border border-med-green/40 text-med-green font-semibold rounded-xl px-5 py-2.5 hover:bg-med-green/10 transition-all duration-200"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>💾</span>
        Export Medical Record
        <span className={`text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-navy-card border border-navy-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-up">
          <button
            onClick={() => { triggerPrint(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-navy-light hover:text-med-green transition-colors text-left"
          >
            <span className="text-base">🖨️</span>
            <div>
              <div className="font-medium">Print to PDF</div>
              <div className="text-xs text-slate-500">Browser print dialog</div>
            </div>
          </button>
          <div className="border-t border-navy-border" />
          <button
            onClick={() => { exportJSON(report); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-navy-light hover:text-med-green transition-colors text-left"
          >
            <span className="text-base">📋</span>
            <div>
              <div className="font-medium">Export JSON</div>
              <div className="text-xs text-slate-500">Raw structured report</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
