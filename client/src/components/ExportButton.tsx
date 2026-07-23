import type { AuditReport } from "../types";
import { buildTextReport } from "../lib/reportText";

interface Props {
  report: AuditReport;
}

function downloadBlob(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ report }: Props) {
  const hostname = new URL(report.site).hostname;

  function handleExportJson() {
    downloadBlob(JSON.stringify(report, null, 2), "application/json", `audit-${hostname}.json`);
  }

  function handleExportText() {
    downloadBlob(buildTextReport(report), "text/plain", `audit-${hostname}.txt`);
  }

  return (
    <div className="export-buttons">
      <button type="button" className="export-button" onClick={handleExportText}>
        Descargar reporte (.txt)
      </button>
      <button type="button" className="export-button" onClick={handleExportJson}>
        Descargar JSON
      </button>
    </div>
  );
}
