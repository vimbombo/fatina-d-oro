/** True when the app should boot straight into FairyTestScene (browser only). */
export function isFairyTestMode(): boolean {
  const fromSearch = new URLSearchParams(window.location.search);
  if (fromSearch.get("scene") === "fairy") return true;
  if (fromSearch.get("fairy") === "1" || fromSearch.get("fairy") === "true") return true;

  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return false;
  if (raw === "fairy") return true;

  const hashQuery = raw.includes("=")
    ? raw.startsWith("?")
      ? raw.slice(1)
      : raw
    : "";
  if (!hashQuery) return false;

  const h = new URLSearchParams(hashQuery);
  if (h.get("scene") === "fairy") return true;
  if (h.get("fairy") === "1" || h.get("fairy") === "true") return true;

  return false;
}
