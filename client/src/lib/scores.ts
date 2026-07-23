import type { PageResult, PageScores } from "../types";

const CATEGORIES = ["performance", "accessibility", "seo", "bestPractices"] as const;

function averageOf(scores: PageScores): number | null {
  const values = CATEGORIES.map((c) => scores[c]).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function auditablePages(pages: PageResult[]): PageResult[] {
  return pages.filter((p) => !p.requiresAuth && p.scores);
}

export function aggregateScores(pages: PageResult[]): Partial<PageScores> {
  const scored = auditablePages(pages);
  const result: Partial<PageScores> = {};
  for (const cat of CATEGORIES) {
    const values = scored.map((p) => p.scores![cat]).filter((v): v is number => v !== null);
    result[cat] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  }
  return result;
}

export function worstPage(pages: PageResult[]): PageResult | null {
  const scored = auditablePages(pages);
  if (scored.length === 0) return null;

  return scored.reduce((worst, page) => {
    const worstAvg = averageOf(worst.scores!) ?? 1;
    const pageAvg = averageOf(page.scores!) ?? 1;
    return pageAvg < worstAvg ? page : worst;
  });
}

export function scoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return "N/A";
  return Math.round(score * 100).toString();
}

export function scoreClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return "score-unknown";
  if (score >= 0.9) return "score-good";
  if (score >= 0.5) return "score-medium";
  return "score-bad";
}
