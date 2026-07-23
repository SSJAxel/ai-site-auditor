import type { AuditReport, Fix } from "../types";
import { aggregateScores, worstPage } from "./scores";

function scoreLine(score: number | null | undefined): string {
  return score === null || score === undefined ? "N/A" : Math.round(score * 100).toString();
}

function fixBlock(fix: Fix): string[] {
  return [
    `[${fix.impact.toUpperCase()}] ${fix.title}`,
    `  ${fix.rationale}`,
    `  Afecta: ${fix.affectedPages.join(", ")}`,
    "",
  ];
}

export function buildTextReport(report: AuditReport): string {
  const lines: string[] = [];
  const push = (line = "") => lines.push(line);

  push(`REPORTE DE AUDITORIA - ${report.site}`);
  push(`Fecha: ${new Date().toLocaleString("es-AR")}`);
  push(`Paginas analizadas: ${report.pagesAnalyzed}`);
  push("");

  const averages = aggregateScores(report.pages);
  push("== RESUMEN GENERAL ==");
  push(`Performance: ${scoreLine(averages.performance)}`);
  push(`Accesibilidad: ${scoreLine(averages.accessibility)}`);
  push(`SEO: ${scoreLine(averages.seo)}`);
  push(`Buenas practicas: ${scoreLine(averages.bestPractices)}`);
  const worst = worstPage(report.pages);
  if (worst) push(`Pagina mas critica: ${worst.url}`);
  push("");

  push("== PRIORIZACION (IA) ==");
  push(report.prioritization.executiveSummary);
  push("");

  const quickWins = report.prioritization.topFixes.filter((f) => f.category === "quick_win");
  const structural = report.prioritization.topFixes.filter((f) => f.category === "structural");

  if (quickWins.length > 0) {
    push("-- Quick wins --");
    for (const fix of quickWins) lines.push(...fixBlock(fix));
  }
  if (structural.length > 0) {
    push("-- Estructurales --");
    for (const fix of structural) lines.push(...fixBlock(fix));
  }

  push("== DETALLE POR PAGINA ==");
  for (const page of report.pages) {
    push(`> ${page.url}`);

    if (page.requiresAuth) {
      push(`  ${page.note ?? "Requiere autenticacion - fuera del alcance de la v1"}`);
      push("");
      continue;
    }

    push(
      `  Performance: ${scoreLine(page.scores?.performance)} | ` +
        `Accesibilidad: ${scoreLine(page.scores?.accessibility)} | ` +
        `SEO: ${scoreLine(page.scores?.seo)} | ` +
        `Buenas practicas: ${scoreLine(page.scores?.bestPractices)}`,
    );

    if (!page.issues || page.issues.length === 0) {
      push("  Sin issues detectados.");
    } else {
      for (const issue of page.issues) {
        push(`  - [${issue.severity.toUpperCase()}] ${issue.title}`);
        push(`    ${issue.description}`);
        if (issue.snippet.actual) push(`    Actual: ${issue.snippet.actual}`);
        if (issue.snippet.suggested) push(`    Sugerido: ${issue.snippet.suggested}`);
      }
    }
    push("");
  }

  return lines.join("\n");
}
