import { useState, useEffect, useRef, useCallback } from 'react';
import TiltCard from './TiltCard';
import PulseOrb from './PulseOrb';

const CONTENT = [
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: "The first computer bug was a literal moth — found trapped in a Harvard Mark II relay on September 9, 1947, and lovingly taped into the logbook by Grace Hopper's team.",
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: "I have keys but no locks, I have space but no room, you can enter but can't go inside. What am I?",
    answer: '⌨️  A keyboard!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: 'SQL injection attacks have been the #1 most exploited web vulnerability for over 20 consecutive years, accounting for nearly 65% of all web application attacks.',
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: "I protect you without a shield, guard you without a sword, and I'm strongest when you update me regularly. What am I?",
    answer: '🔥  A firewall!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: "The average data breach in 2023 cost $4.45 million — a 15% increase over 3 years. IBM's annual Cost of a Data Breach Report found healthcare breaches averaged $10.9 million.",
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: 'I can be 128, 256, or 512 bits long. Once scrambled, only the right key unscrambles me. What am I?',
    answer: '🔐  Encrypted data!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: "The first computer virus, Creeper, was created in 1971 on ARPANET. It displayed: 'I'm the creeper, catch me if you can!' The first antivirus, Reaper, was made specifically to delete it.",
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: "I pretend to be someone I'm not, often landing in your inbox with a familiar logo. Click me and I'll steal your credentials. What am I?",
    answer: '🎣  A phishing email!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: "The most common password worldwide is still '123456' — used by over 23 million accounts. The second most common is literally 'password'.",
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: "I'm invisible, I live between 0 and 1, and I can steal your secrets without ever touching you physically. What am I?",
    answer: '💀  A zero-day exploit!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: "It takes organizations an average of 197 days to identify a data breach and 69 more to contain it — that's 266 days of silent exposure.",
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: 'The more you share me publicly, the less secure you become. What am I?',
    answer: '🗝️  A private key!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: "The Heartbleed bug (CVE-2014-0160) in OpenSSL affected an estimated 17% of all secure web servers — roughly 500,000 machines — allowing attackers to silently read server memory.",
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: "I hide in plain sight inside innocent files, waiting patiently to be executed. I'm often disguised as a document or image. What am I?",
    answer: '🐴  A Trojan malware!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: "In 2016, attackers stole $81 million from Bangladesh Bank using only 5 fraudulent SWIFT transfer requests — exploiting a pattern of trust rather than a sophisticated technical vulnerability.",
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: 'I am the time gap between when a vulnerability is discovered and when a patch is released. Attackers love living inside me. What am I?',
    answer: '⏳  A zero-day window!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: 'The QWERTY keyboard layout was designed in 1873 specifically to slow typists down to prevent typewriter jams — yet it became the world standard and persists 150 years later.',
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: 'I monitor traffic, block threats, log everything, and never sleep. I am your network\'s silent guardian. What am I?',
    answer: '🛡️  An IDS/IPS system!',
  },
  {
    type: 'fact',
    label: '💡 Did You Know?',
    text: 'Over 15 billion credentials from data breaches are freely circulating on the dark web. Credential stuffing attacks use these against other sites where users reused passwords.',
  },
  {
    type: 'riddle',
    label: '🧩 Security Riddle',
    question: 'I make your password effectively longer without you needing to remember anything new. What am I?',
    answer: '🔒  A password manager!',
  },
];

function MedicalCross({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer pulse ring */}
      <div className="absolute w-24 h-24 rounded-full border border-med-green/30 animate-pulse-ring" />
      <div className="absolute w-20 h-20 rounded-full border border-med-green/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
      {/* Cross */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-5 h-16 bg-med-green/90 rounded-full animate-heartbeat" />
        <div className="absolute w-16 h-5 bg-med-green/90 rounded-full animate-heartbeat" />
        <div className="absolute inset-0 bg-med-green/10 rounded-xl" />
      </div>
    </div>
  );
}

// Oximeter readout — replaces the old static ECG strip below the progress bar
function Oximeter() {
  const [bpm, setBpm] = useState(78);

  useEffect(() => {
    const id = setInterval(() => {
      setBpm((b) => {
        const drift = (Math.random() > 0.5 ? 1 : -1) * Math.ceil(Math.random() * 3);
        return Math.max(68, Math.min(98, b + drift));
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <TiltCard maxTilt={8} glowColor="rgba(0,255,157,0.18)">
      <div className="oximeter shrink-0 w-[150px] bg-navy-dark border border-navy-border rounded-lg px-4 py-3 text-left">
        <p className="text-[10px] tracking-widest text-med-green/70 font-mono mb-1">PULSE</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-mono font-bold text-med-green leading-none">{bpm}</span>
          <span className="text-xs font-mono text-med-green/70">bpm</span>
        </div>
        <svg width="100%" height="26" viewBox="0 0 160 30" preserveAspectRatio="none" className="oximeter-wave">
          <path
            d="M0,15 L60,15 L72,4 L82,26 L92,15 L160,15"
            stroke="#00ff9d"
            strokeWidth="2"
            fill="none"
            pathLength="200"
          />
        </svg>
        <style>{`
          .oximeter-wave path {
            stroke-dasharray: 200;
            animation: oximeter-pulse 1.4s linear infinite;
          }
          @keyframes oximeter-pulse {
            0% { stroke-dashoffset: 200; }
            60% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -200; }
          }
        `}</style>
      </div>
    </TiltCard>
  );
}

export default function ScanProgress({ progressData }) {
  const { progress = 0, message = 'Analyzing...' } = progressData;

  // Rotating facts/riddles state
  const [cardIdx, setCardIdx] = useState(() => Math.floor(Math.random() * CONTENT.length));
  const [phase, setPhase] = useState('show'); // 'show' | 'answer' | 'fade'
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    const current = CONTENT[cardIdx];
    if (current.type === 'riddle' && phase === 'show') {
      // Show answer first
      setPhase('answer');
      timerRef.current = setTimeout(() => {
        setPhase('fade');
        timerRef.current = setTimeout(() => {
          setCardIdx((i) => (i + 1) % CONTENT.length);
          setPhase('show');
        }, 400);
      }, 2800);
    } else {
      setPhase('fade');
      timerRef.current = setTimeout(() => {
        setCardIdx((i) => (i + 1) % CONTENT.length);
        setPhase('show');
      }, 400);
    }
  }, [cardIdx, phase]);

  useEffect(() => {
    // 8–12 second random interval
    const delay = 8000 + Math.random() * 4000;
    timerRef.current = setTimeout(advance, delay);
    return () => clearTimeout(timerRef.current);
  }, [advance]);

  const current = CONTENT[cardIdx];

  return (
    <div className="max-w-xl mx-auto text-center animate-fade-up scan-progress">
      {/* Medical cross spinner */}
      <div className="flex justify-center mb-8">
        <PulseOrb progress={progress} />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-1">Diagnosing your file</h2>
      <p className="text-slate-400 text-sm mb-8">
        Please wait while Dr. Code runs a full security workup
      </p>

      {/* Progress bar */}
      <div className="relative">
        <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-navy-dark rounded-full overflow-hidden border border-navy-border">
          <div
            className="h-full progress-fill rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            {/* Pulsing tip */}
            {progress > 2 && progress < 99 && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-med-green rounded-full shadow-[0_0_8px_rgba(0,255,157,0.8)]" />
            )}
          </div>
        </div>

        {/* Status text + oximeter, side by side */}
        <div className="mt-4 flex items-center gap-4">
          <p
            className="flex-1 text-left text-med-green font-medium text-sm tracking-wide animate-heartbeat"
            key={message}
          >
            {message}
          </p>
          <Oximeter />
        </div>
      </div>

      {/* Rotating fact/riddle card */}
      <div className="mt-10">
        <p className="text-xs text-slate-600 font-medium tracking-widest uppercase mb-3">
          While Dr. Code works... 🩺
        </p>
        <TiltCard maxTilt={5} glowColor="rgba(0,255,157,0.10)">
          <div
            className={`card p-5 text-left transition-opacity duration-400 min-h-[120px] ${
              phase === 'fade' ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <p className="text-xs font-semibold text-med-green/80 tracking-widest uppercase mb-2">
              {current.label}
            </p>
            {current.type === 'fact' ? (
              <p className="text-slate-300 text-sm leading-relaxed">{current.text}</p>
            ) : phase === 'answer' ? (
              <>
                <p className="text-slate-400 text-xs italic mb-2 line-through opacity-60">
                  {current.question}
                </p>
                <p className="text-med-green font-semibold text-base">{current.answer}</p>
              </>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">{current.question}</p>
            )}
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
