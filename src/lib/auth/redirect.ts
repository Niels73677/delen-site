/** Only allow same-site relative redirects (prevents open-redirect attacks). */
export function safeNext(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/account/login") || next.startsWith("/account/register")) return fallback;
  return next;
}
