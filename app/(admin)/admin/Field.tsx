"use client";
import type { Site } from "@/lib/content";
import { blank } from "@/lib/merge";
import { applyOp, getIn, setAll, setIn, type ArrayOp, type Path } from "@/lib/admin";

export type Update = (f: (s: Site) => Site) => void;
export const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink";
const btn = "rounded-md border border-line px-2 py-1 text-sm disabled:opacity-40";
const box = "grid gap-3 rounded-xl border border-line p-4";

type Props = { def: unknown; site: Site; roots: Path[]; path: Path; label: string; update: Update };

// Walks the DEFAULT shape, never the data: unknown fields never show, new fields in lib/content.ts
// appear on their own. One input per root, so the content tab shows EN | VI side by side.
export default function Field({ def, site, roots, path, label, update }: Props) {
  const at = (r: Path) => getIn(site, [...r, ...path]);

  if (Array.isArray(def) && typeof def[0] === "object") {
    const items = (at(roots[0]) as unknown[] | undefined) ?? [];
    const op = (o: ArrayOp) => update((s) => setAll(s, roots, path, (v) => applyOp((v as unknown[] | undefined) ?? [], o)));
    return (
      <fieldset className={box}>
        <legend className="px-1 font-semibold">{label}</legend>
        {items.map((_, i) => (
          <div key={i} className="grid gap-3 rounded-lg bg-bg p-3">
            <div className="flex items-center gap-2">
              <span className="mr-auto text-sm text-muted">#{i + 1}</span>
              <button type="button" className={btn} disabled={i === 0} aria-label={`Đưa ${label} ${i + 1} lên`} onClick={() => op({ type: "move", index: i, to: i - 1 })}>↑</button>
              <button type="button" className={btn} disabled={i === items.length - 1} aria-label={`Đưa ${label} ${i + 1} xuống`} onClick={() => op({ type: "move", index: i, to: i + 1 })}>↓</button>
              <button type="button" className={btn} onClick={() => confirm(`Xoá ${label} #${i + 1}?`) && op({ type: "remove", index: i })}>Xoá</button>
            </div>
            <Field def={def[0]} site={site} roots={roots} path={[...path, i]} label="" update={update} />
          </div>
        ))}
        <button type="button" className={`${btn} justify-self-start`} aria-label={`Thêm ${label}`} onClick={() => op({ type: "add", item: blank(def[0]) })}>+ Thêm</button>
      </fieldset>
    );
  }

  if (def && typeof def === "object" && !Array.isArray(def)) {
    const body = Object.entries(def).map(([k, v]) => <Field key={k} def={v} site={site} roots={roots} path={[...path, k]} label={k} update={update} />);
    return label ? (
      <fieldset className={box}>
        <legend className="px-1 font-semibold">{label}</legend>
        {body}
      </fieldset>
    ) : (
      <div className="grid gap-4">{body}</div>
    );
  }

  return (
    <div className="grid gap-1">
      <span className="text-sm text-muted">{label}</span>
      <div className={roots.length > 1 ? "grid gap-2 md:grid-cols-2" : "grid"}>
        {roots.map((r) => (
          <Leaf
            key={r.join(".")}
            def={def}
            value={at(r)}
            label={roots.length > 1 ? `${label} (${r.at(-1)})` : label}
            onChange={(v) => update((s) => setIn(s, [...r, ...path], v))}
          />
        ))}
      </div>
    </div>
  );
}

function Leaf({ def, value, label, onChange }: { def: unknown; value: unknown; label: string; onChange: (v: unknown) => void }) {
  if (typeof def === "number") {
    return <input type="number" aria-label={label} className={input} value={Number.isFinite(value) ? (value as number) : ""} onChange={(e) => onChange(e.target.valueAsNumber)} />;
  }
  if (typeof def === "boolean") {
    return <input type="checkbox" aria-label={label} className="size-5 accent-accent" checked={value === true} onChange={(e) => onChange(e.target.checked)} />;
  }
  if (Array.isArray(def)) {
    const lines = Array.isArray(value) ? (value as string[]) : [];
    return <textarea aria-label={label} title="Mỗi dòng một mục" className={input} rows={Math.max(2, lines.length)} value={lines.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} />;
  }
  const text = typeof value === "string" ? value : "";
  return String(def).length > 80 ? (
    <textarea aria-label={label} className={input} rows={4} value={text} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input aria-label={label} className={input} value={text} onChange={(e) => onChange(e.target.value)} />
  );
}
