import { themeTokens, type Site } from "./content";

// Admin colour overrides as CSS, after globals.css. Only known tokens, and values that can't break
// out of the declaration.
export function themeCss(theme: Site["settings"]["theme"]) {
  const decls = (t: Record<string, string>) =>
    Object.entries(t)
      .filter(([k, v]) => (themeTokens as readonly string[]).includes(k) && /^[#\w\s().,/%-]+$/.test(v))
      .map(([k, v]) => `--${k}:${v};`)
      .join("");
  const light = decls(theme.light);
  const dark = decls(theme.dark);
  return (light ? `:root{${light}}` : "") + (dark ? `:root[data-theme="dark"]{${dark}}` : "");
}
