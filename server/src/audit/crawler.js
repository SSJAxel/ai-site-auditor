import { isLoginWall } from "./loginWall.js";
import { createAuditRunner } from "./lighthouseRunner.js";

const MAX_INTERNAL_LINKS = 5;

// Fetches a page, checks it for a login wall, and extracts same-origin
// links so the caller can decide which ones to visit next.
async function fetchPage(pageUrl) {
  const res = await fetch(pageUrl, { redirect: "follow" });
  const html = await res.text();

  const requiresAuth = isLoginWall({ finalUrl: res.url, status: res.status, html });

  return { finalUrl: res.url, status: res.status, html, requiresAuth };
}

function extractInternalLinks(baseUrl, html) {
  const origin = new URL(baseUrl).origin;
  const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/gi)].map((m) => m[1]);

  const internal = new Set();
  for (const href of hrefs) {
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.origin === origin && resolved.href !== baseUrl) {
        internal.add(resolved.href);
      }
    } catch {
      // ignore unparsable hrefs (mailto:, javascript:, etc.)
    }
  }
  return [...internal].slice(0, MAX_INTERNAL_LINKS);
}

async function runPageAudit(page, auditRunner) {
  if (page.requiresAuth) {
    return {
      url: page.finalUrl,
      requiresAuth: true,
      note: "Requiere autenticacion - fuera del alcance de la v1",
    };
  }

  const { scores, issues } = await auditRunner.runAudit(page.finalUrl);

  return {
    url: page.finalUrl,
    requiresAuth: false,
    scores,
    issues,
  };
}

export async function crawlSite(startUrl, { onProgress = () => {} } = {}) {
  onProgress(`Descargando ${startUrl}...`);
  const homepage = await fetchPage(startUrl);
  const links = homepage.requiresAuth ? [] : extractInternalLinks(homepage.finalUrl, homepage.html);

  if (links.length > 0) {
    onProgress(`Encontrados ${links.length} link(s) internos, descargando...`);
  }
  const otherPages = await Promise.all(links.map((link) => fetchPage(link)));
  const pages = [homepage, ...otherPages];

  const auditRunner = await createAuditRunner();
  try {
    // Sequential on purpose: Lighthouse drives a single shared Chrome
    // instance and profiles CPU/network timing, so concurrent runs would
    // contend for the same resources and skew each other's scores.
    const auditedPages = [];
    for (const [index, page] of pages.entries()) {
      if (!page.requiresAuth) {
        onProgress(`Corriendo Lighthouse en pagina ${index + 1} de ${pages.length}: ${page.finalUrl}`);
      }
      auditedPages.push(await runPageAudit(page, auditRunner));
    }

    return {
      site: startUrl,
      pagesAnalyzed: auditedPages.length,
      pages: auditedPages,
    };
  } finally {
    await auditRunner.close();
  }
}
