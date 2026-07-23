export interface IssueSnippet {
  actual: string | null;
  suggested: string | null;
  affectedElements: number | null;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: "alto" | "medio";
  score: number | null;
  snippet: IssueSnippet;
}

export interface PageScores {
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
}

export interface PageResult {
  url: string;
  requiresAuth: boolean;
  note?: string;
  scores?: PageScores;
  issues?: Issue[];
}

export interface Fix {
  title: string;
  category: "quick_win" | "structural";
  impact: "alto" | "medio" | "bajo";
  affectedPages: string[];
  rationale: string;
}

export interface Prioritization {
  executiveSummary: string;
  topFixes: Fix[];
}

export interface AuditReport {
  site: string;
  pagesAnalyzed: number;
  pages: PageResult[];
  prioritization: Prioritization;
}
