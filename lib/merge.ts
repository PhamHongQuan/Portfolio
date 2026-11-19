import type { Site } from "./content";

// Pure helpers shared by the server read (lib/site.ts) and the admin page. Type-only imports so
// `node --experimental-strip-types` can run the tests without file extensions.
type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);

// An empty value of the same shape: the template for array items the admin adds.
export const blank = (d: Json): Json =>
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

export type Row = { key: string; data: Json };

// Supabase rows laid over the defaults, exactly as the site shows them.
export function fromRows(def: Site, rows: Row[]): Site {
  const row = (k: string) => rows.find((r) => r.key === k)?.data;
  const settings = merge(def.settings, row("settings")) as Site["settings"];
  // Every section exactly once, in the admin's order; unknown ids dropped, missing ones appended.
  const ids = def.settings.sections.map((d) => d.id);
  const order = settings.sections.filter((s, i, a) => ids.includes(s.id) && a.findIndex((x) => x.id === s.id) === i);
  return {
    content: { en: merge(def.content.en, row("en")), vi: merge(def.content.vi, row("vi")) } as Site["content"],
    profile: merge(def.profile, row("profile")) as Site["profile"],
    settings: { ...settings, sections: [...order, ...def.settings.sections.filter((d) => !order.some((s) => s.id === d.id))] },
  };
}

// Pads the shorter of each pair of object arrays (en vs vi, nested ones too) with blank items of the
// other side's shape, so the admin form shows and edits the same items in both languages.
export function pairUp(a: Json, b: Json): [Json, Json] {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (!isObj(a[0] ?? b[0])) return [a, b];
    const pairs = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => pairUp(i < a.length ? a[i] : blank(b[i]), i < b.length ? b[i] : blank(a[i])));
    return [pairs.map((p) => p[0]), pairs.map((p) => p[1])];
  }
  if (isObj(a) && isObj(b)) {
    const ra = { ...a };
    const rb = { ...b };
    for (const k of Object.keys(a)) if (k in b) [ra[k], rb[k]] = pairUp(a[k], b[k]);
    return [ra, rb];
  }
  return [a, b];
}
