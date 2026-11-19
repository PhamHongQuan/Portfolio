import type { Site } from "./content";

// Pure editing helpers for the admin form. Type-only imports (see lib/merge.ts).
export type Path = (string | number)[];
type Bag = Record<string | number, unknown>;

export const getIn = (o: unknown, p: Path): unknown => p.reduce<unknown>((v, k) => (v as Bag | undefined)?.[k], o);

export function setIn<T>(o: T, p: Path, v: unknown): T {
  if (!p.length) return v as T;
  const [k, ...rest] = p;
  const copy = (Array.isArray(o) ? [...o] : { ...(o as object) }) as Bag;
  copy[k] = setIn(copy[k], rest, v);
  return copy as T;
}

// Applies `f` at `p` under every root: the content tab edits arrays of en and vi together.
export const setAll = (site: Site, roots: Path[], p: Path, f: (v: unknown) => unknown): Site =>
  roots.reduce((s, r) => setIn(s, [...r, ...p], f(getIn(s, [...r, ...p]))), site);

export type ArrayOp = { type: "add"; item: unknown } | { type: "remove"; index: number } | { type: "move"; index: number; to: number };

export function applyOp(arr: unknown[], op: ArrayOp): unknown[] {
  const a = [...arr];
  if (op.type === "add") a.push(op.item);
  else if (op.type === "remove") a.splice(op.index, 1);
  else if (op.to >= 0 && op.to < a.length) a.splice(op.to, 0, ...a.splice(op.index, 1));
  return a;
}

// Empty lines in the one-per-line textareas are not items.
export const clean = <T,>(v: T): T =>
  (Array.isArray(v)
    ? v.filter((x) => x !== "").map(clean)
    : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
      : v) as T;

const COLOR = /^[#\w\s().,/%-]+$/;

// Arrays of objects (projects, jobs, stats...) must line up between en and vi.
function sameLength(a: unknown, b: unknown, p: string, errs: string[]) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (typeof a[0] === "object" || typeof b[0] === "object") {
      if (a.length !== b.length) errs.push(`${p}: EN có ${a.length} mục, VI có ${b.length} mục`);
      a.forEach((x, i) => sameLength(x, b[i], `${p}[${i + 1}]`, errs));
    }
  } else if (a && b && typeof a === "object" && typeof b === "object") {
    for (const k of Object.keys(a)) sameLength((a as Bag)[k], (b as Bag)[k], p ? `${p}.${k}` : k, errs);
  }
}

// Everything that would make the site quietly fall back to defaults. Empty list = safe to save.
export function validate(s: Site): string[] {
  const errs: string[] = [];
  if (!URL.canParse(s.profile.site)) errs.push("Hồ sơ: site phải là URL hợp lệ (vd https://hquanpham.id.vn)");
  sameLength(s.content.en, s.content.vi, "", errs);
  for (const lang of ["en", "vi"] as const) {
    const urls = s.content[lang].projects.items.map((p) => String(p.url ?? "").trim());
    urls.forEach((u, i) => {
      if (!u) errs.push(`Dự án ${i + 1} (${lang}): thiếu url`);
      else if (urls.indexOf(u) !== i) errs.push(`Dự án ${i + 1} (${lang}): url trùng với dự án ${urls.indexOf(u) + 1}`);
    });
    s.content[lang].about.stats.forEach((st, i) => {
      if (!Number.isFinite(st.value)) errs.push(`Số liệu ${i + 1} (${lang}): value phải là số`);
    });
  }
  s.content.en.projects.items.forEach((p, i) => {
    const vi = s.content.vi.projects.items[i];
    if (vi && String(vi.url ?? "").trim() !== String(p.url ?? "").trim()) errs.push(`Dự án ${i + 1}: url EN và VI phải giống nhau`);
  });
  for (const mode of ["light", "dark"] as const) {
    for (const [k, v] of Object.entries(s.settings.theme[mode])) if (!COLOR.test(v)) errs.push(`Màu ${k} (${mode}): "${v}" không hợp lệ`);
  }
  return errs;
}
