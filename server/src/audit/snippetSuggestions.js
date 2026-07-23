// Canned fixes for the audit IDs we see most often. Lighthouse tells us
// *what* is broken but never *how* to fix it, so this fills that gap
// without needing the AI layer for well-known, mechanical fixes. Audits not
// listed here fall back to `suggested: null` — that's the gap the AI
// prioritization layer (see docs/SPEC.md) is meant to close later.
const SUGGESTIONS = {
  "landmark-one-main": () =>
    "Envolver el contenido principal en un unico <main>...</main> por pagina.",
  charset: () => '<meta charset="utf-8"> como primera etiqueta dentro de <head>.',
  "meta-description": () =>
    '<meta name="description" content="Resumen conciso del contenido de la pagina">',
  "link-text": (item) =>
    `<a href="${item?.href ?? "..."}">Texto descriptivo del destino del enlace</a> (evitar "Learn more" o "click aqui").`,
  "image-alt": () => '<img src="..." alt="Descripcion del contenido de la imagen">',
  "html-has-lang": () => '<html lang="es"> (o el idioma correspondiente del sitio).',
  "document-title": () => "<title>Titulo descriptivo y unico de la pagina</title>",
  "color-contrast": () =>
    "Ajustar el color de texto o fondo para lograr un contraste minimo de 4.5:1.",
  "tap-targets": () =>
    "Asegurar que los elementos interactivos midan al menos 48x48px con espacio entre ellos.",
};

// Pulls a representative "actual" snippet out of whatever shape a given
// audit's `details` happens to have. Axe-based checks give us real DOM
// snippets; document-level checks (charset, meta-description) have no
// `details` at all since there's no single element to point to; link
// checks give plain href/text pairs instead of a node.
function extractActual(details) {
  const item = details?.type === "table" ? details.items?.[0] : null;
  if (!item) return null;

  if (item.node?.snippet) return item.node.snippet;
  if (item.href) return `<a href="${item.href}">${item.text ?? ""}</a>`;
  return null;
}

export function buildSnippet(audit) {
  const item = audit.details?.type === "table" ? audit.details.items?.[0] : null;
  const actual = extractActual(audit.details);
  const suggestionFn = SUGGESTIONS[audit.id];

  return {
    actual,
    suggested: suggestionFn ? suggestionFn(item) : null,
    affectedElements: audit.details?.items?.length ?? null,
  };
}
