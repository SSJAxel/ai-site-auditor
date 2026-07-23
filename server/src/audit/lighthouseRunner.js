import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { buildSnippet } from "./snippetSuggestions.js";

const CATEGORIES = ["performance", "accessibility", "seo", "best-practices"];

// Failing/borderline audits (score < 0.9) become "issues" in the report,
// per the severity field defined in docs/SPEC.md.
function severityFromScore(score) {
  if (score === null) return null;
  if (score < 0.5) return "alto";
  if (score < 0.9) return "medio";
  return null; // passing audit, not worth reporting as an issue
}

function extractIssues(lhr) {
  const issues = [];
  for (const audit of Object.values(lhr.audits)) {
    if (audit.scoreDisplayMode !== "binary" && audit.scoreDisplayMode !== "numeric") continue;

    const severity = severityFromScore(audit.score);
    if (!severity) continue;

    issues.push({
      id: audit.id,
      title: audit.title,
      description: audit.description,
      severity,
      score: audit.score,
      snippet: buildSnippet(audit),
    });
  }
  return issues;
}

function extractScores(lhr) {
  return {
    performance: lhr.categories.performance?.score ?? null,
    accessibility: lhr.categories.accessibility?.score ?? null,
    seo: lhr.categories.seo?.score ?? null,
    bestPractices: lhr.categories["best-practices"]?.score ?? null,
  };
}

// Launches one headless Chrome instance and reuses it across every page in
// a crawl — launching Chrome per page would add ~1-2s of startup overhead
// each time.
export async function createAuditRunner() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });

  async function runAudit(url) {
    const { lhr } = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      onlyCategories: CATEGORIES,
      logLevel: "error",
    });

    return {
      scores: extractScores(lhr),
      issues: extractIssues(lhr),
    };
  }

  async function close() {
    try {
      await chrome.kill();
    } catch (err) {
      // chrome-launcher can fail to delete its temp profile dir on Windows
      // if a child process hasn't released the file handle yet. Safe to
      // ignore: Chrome is already dead, the OS reclaims the temp dir later.
      if (err.code !== "EPERM") throw err;
    }
  }

  return { runAudit, close };
}
