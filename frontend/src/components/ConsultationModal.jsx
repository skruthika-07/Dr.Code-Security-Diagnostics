import { useState, useRef, useCallback, useEffect } from 'react';

const ACCEPTED_EXTENSIONS = [
  '.py', '.js', '.ts', '.jsx', '.tsx',
  '.java', '.cpp', '.c', '.cs', '.rb', '.go', '.rs', '.php',
  '.swift', '.kt', '.scala', '.sh', '.bash',
  '.txt', '.log', '.yml', '.yaml', '.json', '.xml', '.env',
  '.apk',
];
const IMAGE_EXT = ['.png', '.jpg', '.jpeg'];
const MAX_MB = 20;

const CONTENT = [
  { type: 'fact', label: '💡 Did You Know?', text: "The first computer bug was a literal moth — found trapped in a Harvard Mark II relay on September 9, 1947, and lovingly taped into the logbook by Grace Hopper's team." },
  { type: 'riddle', label: '🧩 Security Riddle', question: "I have keys but no locks, I have space but no room, you can enter but can't go inside. What am I?", answer: '⌨️  A keyboard!' },
  { type: 'fact', label: '💡 Did You Know?', text: 'SQL injection attacks have been the #1 most exploited web vulnerability for over 20 consecutive years, accounting for nearly 65% of all web application attacks.' },
  { type: 'riddle', label: '🧩 Security Riddle', question: "I protect you without a shield, guard you without a sword, and I'm strongest when you update me regularly. What am I?", answer: '🔥  A firewall!' },
  { type: 'fact', label: '💡 Did You Know?', text: "The average data breach in 2023 cost $4.45 million — a 15% increase over 3 years. IBM's annual Cost of a Data Breach Report found healthcare breaches averaged $10.9 million." },
  { type: 'riddle', label: '🧩 Security Riddle', question: 'I can be 128, 256, or 512 bits long. Once scrambled, only the right key unscrambles me. What am I?', answer: '🔐  Encrypted data!' },
  { type: 'fact', label: '💡 Did You Know?', text: "The first computer virus, Creeper, was created in 1971 on ARPANET. It displayed: 'I'm the creeper, catch me if you can!' The first antivirus, Reaper, was made specifically to delete it." },
  { type: 'riddle', label: '🧩 Security Riddle', question: "I pretend to be someone I'm not, often landing in your inbox with a familiar logo. Click me and I'll steal your credentials. What am I?", answer: '🎣  A phishing email!' },
  { type: 'fact', label: '💡 Did You Know?', text: "The most common password worldwide is still '123456' — used by over 23 million accounts. The second most common is literally 'password'." },
  { type: 'riddle', label: '🧩 Security Riddle', question: "I'm invisible, I live between 0 and 1, and I can steal your secrets without ever touching you physically. What am I?", answer: '💀  A zero-day exploit!' },
  { type: 'fact', label: '💡 Did You Know?', text: "It takes organizations an average of 197 days to identify a data breach and 69 more to contain it — that's 266 days of silent exposure." },
  { type: 'riddle', label: '🧩 Security Riddle', question: 'The more you share me publicly, the less secure you become. What am I?', answer: '🗝️  A private key!' },
  { type: 'fact', label: '💡 Did You Know?', text: "The Heartbleed bug (CVE-2014-0160) in OpenSSL affected an estimated 17% of all secure web servers — roughly 500,000 machines — allowing attackers to silently read server memory." },
  { type: 'riddle', label: '🧩 Security Riddle', question: "I hide in plain sight inside innocent files, waiting patiently to be executed. I'm often disguised as a document or image. What am I?", answer: '🐴  A Trojan malware!' },
  { type: 'fact', label: '💡 Did You Know?', text: "In 2016, attackers stole $81 million from Bangladesh Bank using only 5 fraudulent SWIFT transfer requests — exploiting a pattern of trust rather than a sophisticated technical vulnerability." },
  { type: 'riddle', label: '🧩 Security Riddle', question: 'I am the time gap between when a vulnerability is discovered and when a patch is released. Attackers love living inside me. What am I?', answer: '⏳  A zero-day window!' },
  { type: 'fact', label: '💡 Did You Know?', text: 'The QWERTY keyboard layout was designed in 1873 specifically to slow typists down to prevent typewriter jams — yet it became the world standard and persists 150 years later.' },
  { type: 'riddle', label: '🧩 Security Riddle', question: "I monitor traffic, block threats, log everything, and never sleep. I am your network's silent guardian. What am I?", answer: '🛡️  An IDS/IPS system!' },
  { type: 'fact', label: '💡 Did You Know?', text: 'Over 15 billion credentials from data breaches are freely circulating on the dark web. Credential stuffing attacks use these against other sites where users reused passwords.' },
  { type: 'riddle', label: '🧩 Security Riddle', question: 'I make your password effectively longer without you needing to remember anything new. What am I?', answer: '🔒  A password manager!' },
];

function formatExt(file) {
  return '.' + file.name.split('.').pop().toLowerCase();
}

function PulsingHeart() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
      <svg viewBox="0 0 120 100" width="92" height="76">
        <style>{`
          @keyframes modal-heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.16); } 28% { transform: scale(1); } 42% { transform: scale(1.1); } 70% { transform: scale(1); } }
          @keyframes modal-ecg-draw { 0% { stroke-dashoffset: 400; } 70% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }
          .modal-heart { transform-origin: 60px 45px; animation: modal-heartbeat 1.8s ease-in-out infinite; }
          .modal-ecg { stroke-dasharray: 400; animation: modal-ecg-draw 1.6s linear infinite; }
        `}</style>
        <path
          className="modal-heart"
          d="M60,82 C28,58 10,40 10,24 C10,8 26,2 42,13 C49,18 55,25 60,32 C65,25 71,18 78,13 C94,2 110,8 110,24 C110,40 92,58 60,82 Z"
          fill="rgba(54,224,200,0.28)"
          stroke="#4be3a0"
          strokeWidth="2"
        />
        <polyline
          className="modal-ecg"
          pathLength="400"
          points="0,45 30,45 38,45 46,28 54,62 62,10 70,45 120,45"
          fill="none"
          stroke="#36e0c8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 5px rgba(54,224,200,0.8))' }}
        />
      </svg>
    </div>
  );
}

function RiddleCard() {
  const [cardIdx, setCardIdx] = useState(() => Math.floor(Math.random() * CONTENT.length));
  const [phase, setPhase] = useState('show');
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    const current = CONTENT[cardIdx];
    if (current.type === 'riddle' && phase === 'show') {
      setPhase('answer');
      timerRef.current = setTimeout(() => {
        setPhase('fade');
        timerRef.current = setTimeout(() => {
          setCardIdx((i) => (i + 1) % CONTENT.length);
          setPhase('show');
        }, 350);
      }, 2400);
    } else {
      setPhase('fade');
      timerRef.current = setTimeout(() => {
        setCardIdx((i) => (i + 1) % CONTENT.length);
        setPhase('show');
      }, 350);
    }
  }, [cardIdx, phase]);

  useEffect(() => {
    const delay = 6000 + Math.random() * 3000;
    timerRef.current = setTimeout(advance, delay);
    return () => clearTimeout(timerRef.current);
  }, [advance]);

  const current = CONTENT[cardIdx];

  return (
    <div style={{ borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(54,224,200,0.22)', padding: '14px 16px', minHeight: 92, transition: 'opacity 0.35s', opacity: phase === 'fade' ? 0 : 1 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#36e0c8', margin: '0 0 8px' }}>{current.label}</p>
      {current.type === 'fact' ? (
        <p style={{ fontSize: 13, lineHeight: 1.5, color: '#cdd6e4', margin: 0 }}>{current.text}</p>
      ) : phase === 'answer' ? (
        <>
          <p style={{ fontSize: 12, color: '#9aa7bd', fontStyle: 'italic', margin: '0 0 6px', textDecoration: 'line-through', opacity: 0.6 }}>{current.question}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#4be3a0', margin: 0 }}>{current.answer}</p>
        </>
      ) : (
        <p style={{ fontSize: 13, lineHeight: 1.5, color: '#cdd6e4', margin: 0 }}>{current.question}</p>
      )}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" fill="#cdd6e4">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function ConsultationModal({
  onClose, onFileSubmit, onGithubFileSubmit, onConnectGithub,
  githubToken, backend, error, status, progress = 0,
}) {
  const [uploadType, setUploadType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [displayFileName, setDisplayFileName] = useState(null);
  const [validationError, setValidationError] = useState('');
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [ghMode, setGhMode] = useState(false);
  const [ghRepos, setGhRepos] = useState([]);
  const [ghLoadingRepos, setGhLoadingRepos] = useState(false);
  const [ghSelectedRepo, setGhSelectedRepo] = useState(null);
  const [ghFiles, setGhFiles] = useState([]);
  const [ghLoadingFiles, setGhLoadingFiles] = useState(false);
  const [ghFilter, setGhFilter] = useState('');
  const [ghSelectedFile, setGhSelectedFile] = useState(null);
  const [ghPending, setGhPending] = useState(null);

  const validate = useCallback((file, type) => {
    const ext = formatExt(file);
    const allowed = type === 'image' ? IMAGE_EXT : ACCEPTED_EXTENSIONS;
    if (!allowed.includes(ext)) return `Unsupported file type for this option: ${ext}.`;
    if (file.size > MAX_MB * 1024 * 1024) return `File too large. Maximum is ${MAX_MB} MB.`;
    return null;
  }, []);

  const handlePick = useCallback((type, file) => {
    if (!file) return;
    const err = validate(file, type);
    if (err) {
      setValidationError(err);
      setSelectedFile(null);
    } else {
      setValidationError('');
      setSelectedFile(file);
      setDisplayFileName(file.name);
      setUploadType(type);
      setGhPending(null);
    }
  }, [validate]);

  const chooseDoc = () => docInputRef.current?.click();
  const chooseImage = () => imageInputRef.current?.click();

  const openGithub = () => {
    if (!githubToken) {
      onConnectGithub();
      return;
    }
    setGhMode(true);
    setUploadType('github');
    if (ghRepos.length === 0) loadRepos();
  };

  const loadRepos = async () => {
    setGhLoadingRepos(true);
    try {
      const res = await fetch(`${backend}/api/github/repos`, {
        headers: { Authorization: `Bearer ${githubToken}` },
      });
      const data = await res.json();
      setGhRepos(Array.isArray(data) ? data : []);
    } catch (e) {
      setValidationError('Could not load your repositories.');
    } finally {
      setGhLoadingRepos(false);
    }
  };

  const selectRepo = async (repo) => {
    setGhSelectedRepo(repo);
    setGhSelectedFile(null);
    setGhFiles([]);
    setGhFilter('');
    setGhLoadingFiles(true);
    try {
      const res = await fetch(
        `${backend}/api/github/files?owner=${repo.owner}&repo=${repo.name}&branch=${repo.defaultBranch}`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      );
      const data = await res.json();
      setGhFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      setValidationError('Could not load files for that repo.');
    } finally {
      setGhLoadingFiles(false);
    }
  };

  const selectGithubFile = async (file) => {
    setGhSelectedFile(file);
    setValidationError('');
    try {
      const res = await fetch(
        `${backend}/api/github/file-content?owner=${ghSelectedRepo.owner}&repo=${ghSelectedRepo.name}&path=${encodeURIComponent(file.path)}&branch=${ghSelectedRepo.defaultBranch}`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch file');
      setGhPending({
        content: data.content,
        filename: file.path,
        owner: ghSelectedRepo.owner,
        repo: ghSelectedRepo.name,
        branch: ghSelectedRepo.defaultBranch,
        path: data.path,
        sha: data.sha,
      });
      setDisplayFileName(`${ghSelectedRepo.fullName} · ${file.path}`);
      setSelectedFile(null);
    } catch (e) {
      setValidationError(e.message);
    }
  };

  const backToChoices = () => {
    setGhMode(false);
    setUploadType(null);
    setGhSelectedRepo(null);
    setGhSelectedFile(null);
    setGhPending(null);
    setDisplayFileName(null);
  };

  const canContinue = (!!selectedFile && !validationError) || !!ghPending;

  const handleBegin = () => {
    if (!canContinue) return;
    if (ghPending) {
      onGithubFileSubmit(ghPending);
    } else {
      onFileSubmit(selectedFile);
    }
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Ctrl+V handling: image -> screenshot check-in, plain text -> code check-in.
  // Skipped entirely when the paste target is a real text input (e.g. the
  // GitHub file filter box), so normal paste behavior there is untouched.
  useEffect(() => {
    const onPaste = (e) => {
      const targetTag = e.target?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

      const items = e.clipboardData?.items;
      if (items) {
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const ext = file.type === 'image/png' ? 'png' : 'jpg';
              const renamed = new File([file], `clipboard-${Date.now()}.${ext}`, { type: file.type });
              handlePick('image', renamed);
              return;
            }
          }
        }
      }

      const text = e.clipboardData?.getData('text/plain');
      if (text && text.trim().length > 0) {
        const pastedFile = new File([text], `pasted-code-${Date.now()}.txt`, { type: 'text/plain' });
        handlePick('doc', pastedFile);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handlePick]);

  const isScanning = status === 'scanning';
  const s1c = isScanning ? '#4be3a0' : '#36e0c8';
  const s2c = isScanning ? '#36e0c8' : '#5a6478';
  const s3c = progress >= 100 ? '#4be3a0' : '#5a6478';

  const filteredFiles = ghFilter
    ? ghFiles.filter(f => f.path.toLowerCase().includes(ghFilter.toLowerCase()))
    : ghFiles;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(4,5,11,0.74)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 680, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', borderRadius: 26, background: 'linear-gradient(165deg, rgba(20,24,36,0.96), rgba(10,12,22,0.97))', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 110px rgba(0,0,0,0.6)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#36e0c8,#4c8dff)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 13, height: 4, borderRadius: 2, background: '#06070e' }} />
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 4, height: 13, borderRadius: 2, background: '#06070e' }} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: '#eef2f7' }}>Consultation room</span>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9aa7bd', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12.5 }}>
          <span style={{ color: s1c, fontWeight: 600 }}>1 · Check in</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: s2c, fontWeight: 600 }}>2 · Diagnose</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: s3c, fontWeight: 600 }}>3 · Diagnosis &amp; Recovery</span>
        </div>

        <div style={{ padding: '28px 26px 30px', color: '#eef2f7', fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {isScanning ? (
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, fontWeight: 600, margin: '0 0 6px' }}>Examining the patient…</h3>
              <p style={{ fontSize: 13.5, color: '#9aa7bd', margin: '0 0 18px', fontFamily: "'JetBrains Mono', monospace" }}>{displayFileName}</p>
              <PulsingHeart />
              <p
                style={{
                  textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 700, margin: '0 0 4px',
                  background: 'linear-gradient(120deg,#36e0c8,#4be3a0,#4c8dff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}
              >
                {Math.round(progress)}%
              </p>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#9aa7bd', margin: '0 0 18px' }}>Running diagnostics · checking syntax, logic &amp; runtime vitals…</p>
              <RiddleCard />
            </div>
          ) : ghMode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <button onClick={backToChoices} style={{ background: 'none', border: 'none', color: '#9aa7bd', cursor: 'pointer', fontSize: 13, padding: 0 }}>← back</button>
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, fontWeight: 600, margin: '0 0 6px' }}>Pick a repo, then a file</h3>
              <p style={{ fontSize: 13.5, color: '#9aa7bd', margin: '0 0 18px' }}>Connected to GitHub — choose what you'd like Dr. Code to examine.</p>

              {ghLoadingRepos ? (
                <p style={{ fontSize: 13.5, color: '#9aa7bd' }}>Loading your repositories…</p>
              ) : !ghSelectedRepo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {ghRepos.map((r) => (
                    <div
                      key={r.fullName}
                      onClick={() => selectRepo(r)}
                      style={{ cursor: 'pointer', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{r.fullName}</span>
                      {r.private && <span style={{ fontSize: 10.5, color: '#9aa7bd', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '2px 7px' }}>private</span>}
                    </div>
                  ))}
                  {ghRepos.length === 0 && <p style={{ fontSize: 13, color: '#9aa7bd' }}>No repositories found.</p>}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{ghSelectedRepo.fullName}</span>
                    <button onClick={() => { setGhSelectedRepo(null); setGhFiles([]); }} style={{ background: 'none', border: 'none', color: '#36e0c8', cursor: 'pointer', fontSize: 12.5 }}>change repo</button>
                  </div>
                  <input
                    value={ghFilter}
                    onChange={(e) => setGhFilter(e.target.value)}
                    placeholder="Filter files…"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eef2f7', fontSize: 13, marginBottom: 10, outline: 'none' }}
                  />
                  {ghLoadingFiles ? (
                    <p style={{ fontSize: 13.5, color: '#9aa7bd' }}>Loading files…</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                      {filteredFiles.map((f) => (
                        <div
                          key={f.path}
                          onClick={() => selectGithubFile(f)}
                          style={{
                            cursor: 'pointer', padding: '9px 12px', borderRadius: 9, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                            background: ghSelectedFile?.path === f.path ? 'rgba(54,224,200,0.12)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${ghSelectedFile?.path === f.path ? '#36e0c8' : 'rgba(255,255,255,0.07)'}`,
                          }}
                        >
                          {f.path}
                        </div>
                      ))}
                      {filteredFiles.length === 0 && <p style={{ fontSize: 13, color: '#9aa7bd' }}>No matching files.</p>}
                    </div>
                  )}
                </div>
              )}

              {ghPending && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 13, background: 'rgba(75,227,160,0.09)', border: '1px solid rgba(75,227,160,0.25)', marginTop: 16, marginBottom: 16 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(75,227,160,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4be3a0', fontWeight: 700 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{ghPending.filename}</div>
                    <div style={{ fontSize: 12, color: '#9aa7bd' }}>checked in · ready for examination</div>
                  </div>
                </div>
              )}

              {validationError && <div style={{ fontSize: 13, color: '#ff8a98', marginBottom: 16 }}>{validationError}</div>}

              {canContinue ? (
                <button onClick={handleBegin} style={{ width: '100%', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15.5, fontWeight: 600, color: '#06070e', border: 'none', cursor: 'pointer', padding: 15, borderRadius: 13, background: 'linear-gradient(135deg,#36e0c8,#4be3a0)', boxShadow: '0 10px 30px rgba(54,224,200,0.3)' }}>
                  Begin examination →
                </button>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#5a6478', padding: 14, borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  Select a file to continue
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, fontWeight: 600, margin: '0 0 6px' }}>What's bothering your code today?</h3>
              <p style={{ fontSize: 14.5, color: '#9aa7bd', margin: '0 0 24px' }}>Bring in the patient — upload a code file, a screenshot, or connect a GitHub repo.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
                <div
                  onClick={chooseDoc}
                  style={{ cursor: 'pointer', padding: '20px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${uploadType === 'doc' ? '#36e0c8' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(54,224,200,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <svg viewBox="0 0 20 24" width="16" height="20">
                      <path d="M3 1 H12 L17 6 V23 H3 Z" fill="none" stroke="#36e0c8" strokeWidth="1.6" strokeLinejoin="round" />
                      <line x1="6" y1="12" x2="14" y2="12" stroke="#36e0c8" strokeWidth="1.6" />
                      <line x1="6" y1="16" x2="14" y2="16" stroke="#36e0c8" strokeWidth="1.6" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 3 }}>Code document</div>
                  <div style={{ fontSize: 11.5, color: '#9aa7bd', marginBottom: 6 }}>browse, or paste code with Ctrl+V</div>
                  <div style={{ fontSize: '10.5px', color: '#7a8699', lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
                    {ACCEPTED_EXTENSIONS.join(' ')}
                  </div>
                </div>

                <div
                  onClick={chooseImage}
                  style={{ cursor: 'pointer', padding: '20px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${uploadType === 'image' ? '#4c8dff' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(76,141,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <svg viewBox="0 0 22 20" width="18" height="16">
                      <rect x="1" y="2" width="20" height="16" rx="2.5" fill="none" stroke="#4c8dff" strokeWidth="1.6" />
                      <circle cx="7" cy="8" r="2" fill="#4c8dff" />
                      <path d="M3 16 L9 10 L13 14 L16 11 L19 15" fill="none" stroke="#4c8dff" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 3 }}>Screenshot</div>
                  <div style={{ fontSize: 11.5, color: '#9aa7bd' }}>.png .jpg .jpeg — or Ctrl+V</div>
                </div>

                <div
                  onClick={openGithub}
                  style={{ cursor: 'pointer', padding: '20px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${uploadType === 'github' ? '#cdd6e4' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <GitHubIcon />
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 3 }}>GitHub repo</div>
                  <div style={{ fontSize: 11.5, color: '#9aa7bd' }}>{githubToken ? 'Browse a repo' : 'Connect & scan'}</div>
                </div>
              </div>

              <input ref={docInputRef} type="file" className="hidden" accept={ACCEPTED_EXTENSIONS.join(',')} onChange={(e) => handlePick('doc', e.target.files?.[0])} />
              <input ref={imageInputRef} type="file" className="hidden" accept={IMAGE_EXT.join(',')} onChange={(e) => handlePick('image', e.target.files?.[0])} />

              {selectedFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 13, background: 'rgba(75,227,160,0.09)', border: '1px solid rgba(75,227,160,0.25)', marginBottom: 20 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(75,227,160,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4be3a0', fontWeight: 700 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 12, color: '#9aa7bd' }}>checked in · ready for examination</div>
                  </div>
                </div>
              )}

              {(validationError || error) && (
                <div style={{ fontSize: 13, color: '#ff8a98', marginBottom: 16 }}>{validationError || error}</div>
              )}

              {canContinue ? (
                <button onClick={handleBegin} style={{ width: '100%', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15.5, fontWeight: 600, color: '#06070e', border: 'none', cursor: 'pointer', padding: 15, borderRadius: 13, background: 'linear-gradient(135deg,#36e0c8,#4be3a0)', boxShadow: '0 10px 30px rgba(54,224,200,0.3)' }}>
                  Begin examination →
                </button>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', fontSize: 15.5, fontWeight: 600, color: '#5a6478', padding: 15, borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  Select a check-in method to continue
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}