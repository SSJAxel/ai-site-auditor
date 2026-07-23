import { useRef, useState } from "react";
import "./App.css";
import type { AuditReport } from "./types";
import { AuditForm } from "./components/AuditForm";
import { AuditProgress } from "./components/AuditProgress";
import { ReportView } from "./components/ReportView";
import { Footer } from "./components/Footer";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function App() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  function runAudit(url: string) {
    eventSourceRef.current?.close();

    setLoading(true);
    setError(null);
    setReport(null);
    setProgress(null);

    const es = new EventSource(`${API_URL}/audit/stream?url=${encodeURIComponent(url)}`);
    eventSourceRef.current = es;

    es.addEventListener("progress", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setProgress(data.message);
    });

    es.addEventListener("done", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setReport(data);
      setLoading(false);
      es.close();
    });

    es.addEventListener("failed", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setError(data.message);
      setLoading(false);
      es.close();
    });

    // "done"/"failed" always call es.close() themselves before this can fire,
    // so reaching here means the connection genuinely dropped mid-request.
    es.onerror = () => {
      setError("Se perdio la conexion con el servidor.");
      setLoading(false);
      es.close();
    };
  }

  return (
    <div className="app">
      <header>
        <h1>AI Site Auditor</h1>
        <p>
          Auditá performance, accesibilidad, SEO y buenas prácticas de un sitio, con fixes
          priorizados por IA local.
        </p>
      </header>

      <AuditForm onSubmit={runAudit} loading={loading} />

      {error && <p className="error">{error}</p>}
      {loading && <AuditProgress message={progress} />}
      {report && <ReportView report={report} />}

      <Footer />
    </div>
  );
}

export default App;
