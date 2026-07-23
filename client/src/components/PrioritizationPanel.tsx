import type { Prioritization } from "../types";

interface Props {
  prioritization: Prioritization;
}

export function PrioritizationPanel({ prioritization }: Props) {
  const quickWins = prioritization.topFixes.filter((f) => f.category === "quick_win");
  const structural = prioritization.topFixes.filter((f) => f.category === "structural");

  return (
    <section className="card">
      <h2>Priorizacion (IA)</h2>
      <p className="executive-summary">{prioritization.executiveSummary}</p>

      {quickWins.length > 0 && (
        <>
          <h3>Quick wins</h3>
          <ul className="fix-list">
            {quickWins.map((fix, i) => (
              <FixItem key={i} fix={fix} />
            ))}
          </ul>
        </>
      )}

      {structural.length > 0 && (
        <>
          <h3>Estructurales</h3>
          <ul className="fix-list">
            {structural.map((fix, i) => (
              <FixItem key={i} fix={fix} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function FixItem({ fix }: { fix: Prioritization["topFixes"][number] }) {
  return (
    <li className={`fix-item impact-${fix.impact}`}>
      <div className="fix-header">
        <span className="fix-title">{fix.title}</span>
        <span className={`impact-badge impact-${fix.impact}`}>{fix.impact}</span>
      </div>
      <p className="fix-rationale">{fix.rationale}</p>
      <p className="fix-pages muted">Afecta: {fix.affectedPages.join(", ")}</p>
    </li>
  );
}
