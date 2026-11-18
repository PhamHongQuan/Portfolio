import { cache } from "react";
import { content, profile, settings, themeTokens, type Site } from "./content";

// Server only. Reads the site from Supabase (table `site_content`, one row per key: en, vi, profile,
// settings) and lays it over the defaults in lib/content.ts. No env, a failed request or a broken
// row: the defaults show instead. Cached until the admin calls /api/revalidate (tag "content").
export const CONTENT_TAG = "content";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);

// An empty value of the same shape: the template for array items the admin adds.
const blank = (d: Json): Json =>
  Array.isArray(d) ? [] : isObj(d) ? Object.fromEntries(Object.entries(d).map(([k, v]) => [k, blank(v)])) : typeof d === "number" ? 0 : typeof d === "boolean" ? false : "";

// Takes `remote` where it has the same type as `def`, keeps `def` otherwise, so a bad row can't crash
// a component. Array items are checked against the first default item; empty default arrays and
// free-form records (theme) accept any primitive values.
export function merge(def: Json, remote: Json): Json {
  if (Array.isArray(def)) {
    if (!Array.isArray(remote)) return def;
    if (def.length === 0) return remote.filter((v) => typeof v === "string" || typeof v === "number");
    const tpl = blank(def[0]);
    return remote.map((r) => merge(tpl, r));
  }
  if (isObj(def)) {
    if (!isObj(remote)) return def;
    if (Object.keys(def).length === 0) return Object.fromEntries(Object.entries(remote).filter(([, v]) => typeof v === "string"));
    return Object.fromEntries(Object.entries(def).map(([k, v]) => [k, k in remote ? merge(v, remote[k]) : v]));
  }
  return typeof remote === typeof def ? remote : def;
}

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
    const rows = (await res.json()) as { key: string; data: Json }[];
    const row = (k: string) => rows.find((r) => r.key === k)?.data;
    const site = {
      content: { en: merge(content.en, row("en")), vi: merge(content.vi, row("vi")) },
      profile: merge(profile, row("profile")),
      settings: merge(settings, row("settings")),
    } as Site;
    // Every section exactly once, in the admin's order; unknown ids dropped, missing ones appended.
    const order = site.settings.sections.filter((s, i, a) => settings.sections.some((d) => d.id === s.id) && a.findIndex((x) => x.id === s.id) === i);
    site.settings.sections = [...order, ...settings.sections.filter((d) => !order.some((s) => s.id === d.id))];
    return site;
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
