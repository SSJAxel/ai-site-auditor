import type { AuditReport } from "../types";
import { aggregateScores, worstPage } from "../lib/scores";
import { ScoreBadge } from "./ScoreBadge";

interface Props {
  report: AuditReport;
}

export function ReportSummary({ report }: Props) {
  const averages = aggregateScores(report.pages);
  const worst = worstPage(report.pages);

  return (
    <section className="card">
      <h2>Resumen general</h2>
      <p className="muted">
        {report.site} &middot; {report.pagesAnalyzed} pagina(s) analizada(s)
      </p>
      <div className="score-grid">
        <ScoreBadge label="Performance" score={averages.performance} />
        <ScoreBadge label="Accesibilidad" score={averages.accessibility} />
        <ScoreBadge label="SEO" score={averages.seo} />
        <ScoreBadge label="Buenas practicas" score={averages.bestPractices} />
      </div>
      {worst && (
        <p className="worst-page">
          Pagina mas critica: <a href={worst.url} target="_blank" rel="noreferrer">{worst.url}</a>
        </p>
      )}
    </section>
  );
}
