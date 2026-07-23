import type { Issue, PageResult } from "../types";
import { ScoreBadge } from "./ScoreBadge";

interface Props {
  page: PageResult;
}

export function PageDetail({ page }: Props) {
  if (page.requiresAuth) {
    return (
      <details className="page-detail">
        <summary>{page.url}</summary>
        <p className="muted">{page.note ?? "Requiere autenticacion - fuera del alcance de la v1"}</p>
      </details>
    );
  }

  return (
    <details className="page-detail">
      <summary>{page.url}</summary>
      <div className="score-grid compact">
        <ScoreBadge label="Performance" score={page.scores?.performance} />
        <ScoreBadge label="Accesibilidad" score={page.scores?.accessibility} />
        <ScoreBadge label="SEO" score={page.scores?.seo} />
        <ScoreBadge label="Buenas practicas" score={page.scores?.bestPractices} />
      </div>
      {page.issues && page.issues.length > 0 ? (
        <ul className="issue-list">
          {page.issues.map((issue) => (
            <IssueItem key={issue.id} issue={issue} />
          ))}
        </ul>
      ) : (
        <p className="muted">Sin issues detectados.</p>
      )}
    </details>
  );
}

function IssueItem({ issue }: { issue: Issue }) {
  return (
    <li className={`issue-item severity-${issue.severity}`}>
      <div className="issue-header">
        <span className="issue-title">{issue.title}</span>
        <span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span>
      </div>
      <p className="issue-description">{issue.description}</p>
      {(issue.snippet.actual || issue.snippet.suggested) && (
        <div className="snippet-pair">
          {issue.snippet.actual && (
            <div className="snippet">
              <span className="snippet-label">Actual</span>
              <pre>{issue.snippet.actual}</pre>
            </div>
          )}
          {issue.snippet.suggested && (
            <div className="snippet snippet-suggested">
              <span className="snippet-label">Sugerido</span>
              <pre>{issue.snippet.suggested}</pre>
            </div>
          )}
        </div>
      )}
      {issue.snippet.affectedElements !== null && (
        <p className="muted small">
          {issue.snippet.affectedElements} elemento(s) afectado(s)
        </p>
      )}
    </li>
  );
}
