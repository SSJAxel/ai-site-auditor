// Runs entirely against a local Ollama instance - no API key, no per-request
// cost. See docs/SPEC.md: this project has zero ongoing cost by design.
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

const PRIORITIZATION_SCHEMA = {
  type: "object",
  properties: {
    executiveSummary: { type: "string" },
    topFixes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: { type: "string", enum: ["quick_win", "structural"] },
          impact: { type: "string", enum: ["alto", "medio", "bajo"] },
          affectedPages: { type: "array", items: { type: "string" } },
          rationale: { type: "string" },
        },
        required: ["title", "category", "impact", "affectedPages", "rationale"],
      },
    },
  },
  required: ["executiveSummary", "topFixes"],
};

function buildPrompt(auditResult) {
  return `Sos un auditor senior de sitios web. Te paso el resultado crudo de un audit (Lighthouse) de varias paginas de un mismo sitio, en JSON.

Tu trabajo:
1. Un resumen ejecutivo de 1-2 frases sobre el estado general del sitio.
2. Entre 5 y 10 fixes priorizados considerando el sitio completo (no repitas el mismo issue por cada pagina afectada - agrupa issues iguales o similares en un solo fix y listá las paginas afectadas). Ordená por impacto/esfuerzo y categorizá cada uno como "quick_win" (arreglable en menos de 1 hora) o "structural".

Resultado del audit:
${JSON.stringify(auditResult, null, 2)}`;
}

// Skipping pages that require auth (see loginWall.js) - only real issues count
// toward whether there's anything to prioritize.
function countIssues(auditResult) {
  return auditResult.pages.reduce((total, page) => total + (page.issues?.length ?? 0), 0);
}

export async function prioritizeAudit(auditResult) {
  if (countIssues(auditResult) === 0) {
    return {
      executiveSummary: "No se encontraron issues relevantes en las paginas analizadas.",
      topFixes: [],
    };
  }

  let response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: buildPrompt(auditResult) }],
        format: PRIORITIZATION_SCHEMA,
        stream: false,
      }),
    });
  } catch {
    throw new Error(
      `No se pudo conectar con Ollama en ${OLLAMA_BASE_URL}. Corré "ollama serve" (o abrí la app de Ollama) y volvé a intentar.`,
    );
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama respondio ${response.status}: ${body}`);
  }

  const data = await response.json();
  return JSON.parse(data.message.content);
}
