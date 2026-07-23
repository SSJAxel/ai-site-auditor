import type { AuditReport } from "../types";
import { ReportSummary } from "./ReportSummary";
import { PrioritizationPanel } from "./PrioritizationPanel";
import { PageDetail } from "./PageDetail";
import { ExportButton } from "./ExportButton";

interface Props {
  report: AuditReport;
}

export function ReportView({ report }: Props) {
  return (
    <div className="report-view">
      <ReportSummary report={report} />
      <PrioritizationPanel prioritization={report.prioritization} />

      <section className="card">
        <h2>Detalle por pagina</h2>
        <div className="page-list">
          {report.pages.map((page) => (
            <PageDetail key={page.url} page={page} />
          ))}
        </div>
      </section>

      <ExportButton report={report} />
    </div>
  );
}
