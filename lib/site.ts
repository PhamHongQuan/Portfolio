import { cache } from "react";
import { content, profile, settings, themeTokens, type Site } from "./content";
import { fromRows, type Row } from "./merge";

// Server only. Reads the site from Supabase (table `site_content`, one row per key: en, vi, profile,
// settings) and lays it over the defaults in lib/content.ts (lib/merge.ts). No env, a failed request or a broken
// row: the defaults show instead. Cached until the admin publishes (tag "content").
export const CONTENT_TAG = "content";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const defaults: Site = { content, profile, settings };

export const getSite = cache(async (): Promise<Site> => {
  if (!url || !key) return defaults;
  try {
    const res = await fetch(`${url}/rest/v1/site_content?select=key,data`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "force-cache",
      next: { tags: [CONTENT_TAG] },
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return fromRows(defaults, (await res.json()) as Row[]);
  } catch (e) {
    console.error("[site] using defaults:", e);
    return defaults;
  }
});

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
