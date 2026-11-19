"use client";
import { useId, useState, type PointerEvent } from "react";
import type { Site } from "@/lib/content";
import { blank } from "@/lib/merge";
import { applyOp, getIn, setAll, setIn, type ArrayOp, type Path } from "@/lib/admin";
import { itemNames, labels } from "./labels";

export type Update = (f: (s: Site) => Site) => void;
export const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none";
export const btn = "rounded-md border border-line bg-surface px-2 py-1 text-sm hover:border-accent disabled:opacity-40";
export const card = "grid gap-4 rounded-xl border border-line bg-surface p-4";

type Props = { def: unknown; site: Site; roots: Path[]; path: Path; ns?: string; update: Update };

// "projects.items.study.did": the label key for a path, array indexes dropped.
const keyOf = (ns: string, path: Path) => [ns, ...path.filter((p) => typeof p === "string")].filter(Boolean).join(".");
const labelOf = (ns: string, path: Path) => labels[keyOf(ns, path)] ?? String(path.findLast((p) => typeof p === "string") ?? "");
const lastIndex = (path: Path) => path.findLast((p) => typeof p === "number") as number | undefined;

// What a collapsed item shows: its first name-like field, plus a year/company/period hint.
function summary(item: unknown): [string, string] {
  const o = (item ?? {}) as Record<string, unknown>;
  const pick = (ks: string[]) => String(ks.map((k) => o[k]).find((v) => (typeof v === "string" && v.trim()) || typeof v === "number") ?? "");
  return [pick(["name", "title", "role", "label", "value"]), pick(["year", "org", "period", "kind", "level"])];
}

// Drag-to-reorder for a list: grab the handle (mouse, pen or finger), drop on another row.
// Pointer events, not HTML5 drag and drop, so it works on touch too. ↑ ↓ stay for keyboards.
export function useSort(move: (from: number, to: number) => void) {
  const group = useId();
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);
  const target = (e: PointerEvent) => document.elementFromPoint(e.clientX, e.clientY)?.closest(`[data-sort="${group}"]`)?.getAttribute("data-index");
  return {
    drag,
    row: (i: number) => ({ "data-sort": group, "data-index": i }),
    handle: (i: number) => ({
      className: `${btn} cursor-grab touch-none select-none active:cursor-grabbing`,
      "aria-hidden": true,
      title: "Kéo để đổi thứ tự",
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag({ from: i, to: i });
      },
      onPointerMove: (e: PointerEvent) => {
        const to = target(e);
        if (drag && to != null) setDrag({ from: drag.from, to: Number(to) });
      },
      onPointerUp: () => {
        if (drag && drag.to !== drag.from) move(drag.from, drag.to);
        setDrag(null);
      },
      onPointerCancel: () => setDrag(null),
    }),
    // Dragged row fades; the drop row shows a line on the side the item will land.
    rowClass: (i: number) =>
      !drag ? "" : i === drag.from ? "opacity-40" : i === drag.to ? (drag.to < drag.from ? "shadow-[0_-3px_0_var(--color-accent)]" : "shadow-[0_3px_0_var(--color-accent)]") : "",
  };
}

// Walks the DEFAULT shape, never the data: unknown fields never show, new fields in lib/content.ts
// appear on their own. One input per root, so content shows EN | VI side by side.
export default function Field({ def, site, roots, path, ns = "", update }: Props) {
  const at = (r: Path) => getIn(site, [...r, ...path]);
  const label = labelOf(ns, path);

  if (Array.isArray(def) && typeof def[0] === "object") return <Items def={def} site={site} roots={roots} path={path} ns={ns} update={update} />;

  if (def && typeof def === "object" && !Array.isArray(def)) {
    const body = Object.entries(def).map(([k, v]) => <Field key={k} def={v} site={site} roots={roots} path={[...path, k]} ns={ns} update={update} />);
    // Fields of one array item, or a whole tab: no extra frame.
    if (!path.length || typeof path.at(-1) === "number") return <>{body}</>;
    return (
      <fieldset className="grid gap-4 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-semibold">{label}</legend>
        {body}
      </fieldset>
    );
  }

  const i = lastIndex(path);
  const name = i === undefined ? label : `${label} #${i + 1}`;
  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {Array.isArray(def) && <span className="-mt-1 text-xs text-muted">Mỗi dòng một mục</span>}
      <div className={roots.length > 1 ? "grid gap-2 md:grid-cols-2" : "grid"}>
        {roots.map((r) => {
          const lang = roots.length > 1 ? String(r.at(-1)) : "";
          return (
            <div key={r.join(".")} className="relative">
              <Leaf def={def} value={at(r)} label={lang ? `${name} (${lang})` : name} onChange={(v) => update((s) => setIn(s, [...r, ...path], v))} />
              {lang && <span className="pointer-events-none absolute top-2 right-2 rounded bg-bg px-1 text-[10px] font-semibold text-muted uppercase">{lang}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Items({ def, site, roots, path, ns = "", update }: Props & { def: unknown[] }) {
  const items = (getIn(site, [...roots[0], ...path]) as unknown[] | undefined) ?? [];
  const one = itemNames[keyOf(ns, path)] ?? "mục";
  const op = (o: ArrayOp) => update((s) => setAll(s, roots, path, (v) => applyOp((v as unknown[] | undefined) ?? [], o)));
  const sort = useSort((index, to) => op({ type: "move", index, to }));
  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-semibold">{labelOf(ns, path)}</h3>
      {items.map((item, i) => {
        const [title, sub] = summary(item);
        return (
          <div key={i} {...sort.row(i)} className={`relative rounded-xl border border-line bg-surface ${sort.rowClass(i)}`}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 py-3 pr-44 pl-4 marker:hidden">
                <span className="text-muted transition-transform group-open:rotate-90" aria-hidden>▸</span>
                <span className="truncate font-medium">{title || <span className="text-muted">{`${one} #${i + 1} (trống)`}</span>}</span>
                {sub && <span className="shrink-0 text-sm text-muted">· {sub}</span>}
              </summary>
              <div className="grid gap-4 border-t border-line p-4">
                <Field def={def[0]} site={site} roots={roots} path={[...path, i]} ns={ns} update={update} />
              </div>
            </details>
            <div className="absolute top-2 right-2 flex gap-1">
              <span {...sort.handle(i)}>⠿</span>
              <button type="button" className={btn} disabled={i === 0} aria-label={`Đưa ${one} #${i + 1} lên`} onClick={() => op({ type: "move", index: i, to: i - 1 })}>↑</button>
              <button type="button" className={btn} disabled={i === items.length - 1} aria-label={`Đưa ${one} #${i + 1} xuống`} onClick={() => op({ type: "move", index: i, to: i + 1 })}>↓</button>
              <button type="button" className={btn} aria-label={`Xoá ${one} #${i + 1}`} onClick={() => confirm(`Xoá ${one} #${i + 1}${title ? ` (${title})` : ""}?`) && op({ type: "remove", index: i })}>✕</button>
            </div>
          </div>
        );
      })}
      <button type="button" className={`${btn} justify-self-start px-3 py-1.5 text-accent`} onClick={() => op({ type: "add", item: blank(def[0]) })}>
        + Thêm {one}
      </button>
    </section>
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
    return <textarea aria-label={label} className={`${input} pr-10`} rows={Math.max(2, lines.length)} value={lines.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} />;
  }
  const text = typeof value === "string" ? value : "";
  return String(def).length > 80 ? (
    <textarea aria-label={label} className={`${input} pr-10`} rows={4} value={text} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input aria-label={label} className={`${input} pr-10`} value={text} onChange={(e) => onChange(e.target.value)} />
  );
}
