const LOGIN_PATH_HINTS = ["/login", "/signin", "/sign-in", "/account/login"];

// Heuristic check for whether a fetched page is actually a login wall rather
// than the requested content. Per docs/SPEC.md: pages behind auth are
// excluded from the v1 audit, never auto-filled with credentials.
export function isLoginWall({ finalUrl, status, html }) {
  if (status === 401 || status === 403) return true;

  const path = new URL(finalUrl).pathname.toLowerCase();
  if (LOGIN_PATH_HINTS.some((hint) => path.includes(hint))) return true;

  const hasPasswordField = /<input[^>]+type=["']password["']/i.test(html);
  return hasPasswordField;
}
