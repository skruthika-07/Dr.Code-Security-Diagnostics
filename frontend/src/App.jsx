import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ConsultationModal from "./components/ConsultationModal";
import DiagnosisReport from "./components/DiagnosisReport";
import RejectionModal from "./components/RejectionModal";

const BACKEND = "https://dr-code-security-diagnostics.onrender.com";
export default function App() {
  const [status, setStatus] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [rejected, setRejected] = useState(null);
  const [progress, setProgress] = useState(0);
  const [consultOpen, setConsultOpen] = useState(false);
  const [githubToken, setGithubToken] = useState(() => sessionStorage.getItem('drcode_github_token') || null);
  const [githubMeta, setGithubMeta] = useState(null);
  const [scannedFileName, setScannedFileName] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('github_token');
    if (token) {
      setGithubToken(token);
      sessionStorage.setItem('drcode_github_token', token);
      setConsultOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  async function handleFile(file) {
    setStatus("scanning");
    setError(null);
    setReport(null);
    setRejected(null);
    setProgress(10);
    setGithubMeta(null);
    setScannedFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 5, 90));
    }, 1000);

    try {
      const res = await fetch(`${BACKEND}/api/analyze`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(data.error || "Server error");
      setProgress(100);
      setTimeout(() => { setReport(data); setStatus("done"); }, 500);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setStatus("error");
      setConsultOpen(true);
    }
  }

  async function handleGithubFile({ content, filename, owner, repo, branch, path, sha }) {
    setStatus("scanning");
    setError(null);
    setReport(null);
    setRejected(null);
    setProgress(10);
    setGithubMeta({ owner, repo, branch, path, sha, originalContent: content });
    setScannedFileName(path);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 5, 90));
    }, 1000);

    try {
      const res = await fetch(`${BACKEND}/api/analyze-github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, filename }),
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(data.error || "Server error");
      setProgress(100);
      setTimeout(() => { setReport(data); setStatus("done"); }, 500);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setStatus("error");
      setConsultOpen(true);
    }
  }

  function handleConnectGithub() {
    window.location.href = `${BACKEND}/auth/github`;
  }

  useEffect(() => {
    if (status === "done") setConsultOpen(false);
  }, [status]);

  const showReport = status === "done" && report;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {showReport ? (
        <>
          <Header />
          <DiagnosisReport
            report={report}
            githubMeta={githubMeta}
            githubToken={githubToken}
            backend={BACKEND}
            fileName={scannedFileName}
            onReset={() => { setStatus("idle"); setReport(null); setProgress(0); setGithubMeta(null); setScannedFileName(null); }}
          />
        </>
      ) : (
        <Hero onStartDiagnosis={() => setConsultOpen(true)} />
      )}

      {consultOpen && (
        <ConsultationModal
          onClose={() => setConsultOpen(false)}
          onFileSubmit={handleFile}
          onGithubFileSubmit={handleGithubFile}
          onConnectGithub={handleConnectGithub}
          githubToken={githubToken}
          backend={BACKEND}
          error={status === "error" ? error : null}
          status={status}
          progress={progress}
        />
      )}

      {rejected && (
        <RejectionModal
          reason={rejected}
          onClose={() => setRejected(null)}
        />
      )}
    </div>
  );
}