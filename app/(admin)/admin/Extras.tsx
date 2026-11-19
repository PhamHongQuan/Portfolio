"use client";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fixedScenes, lookFor, projectLook, scenePalettes, sceneSets, sceneTimes, sceneWinds, themeTokens, type Look, type Site } from "@/lib/content";
import { applyOp, setIn } from "@/lib/admin";
import { btn, card, input, useSort, type Update } from "./Field";
import { layerGroups, paletteNames, sceneNames, sectionNames, setNames, timeNames, tokenNames, windNames } from "./labels";

// Order and visibility only: ids are fixed in code.
export function Sections({ site, update }: { site: Site; update: Update }) {
  const list = site.settings.sections;
  const set = (next: unknown[]) => update((s) => setIn(s, ["settings", "sections"], next));
  const sort = useSort((index, to) => set(applyOp(list, { type: "move", index, to })));
  return (
    <div className={card}>
      <p className="text-sm text-muted">Bỏ chọn để ẩn một mục; kéo ⠿ hoặc dùng ↑ ↓ để đổi thứ tự. Hero luôn đứng đầu. Thứ tự mặc định khớp hành trình đêm → bình minh của phong cảnh.</p>
      {list.map((sec, i) => (
        <div key={sec.id} {...sort.row(i)} className={`flex items-center gap-2 rounded-lg ${sort.rowClass(i)}`}>
          <label className="mr-auto flex items-center gap-2">
            <input type="checkbox" className="size-5 accent-accent" checked={sec.visible} onChange={(e) => set(list.map((x) => (x.id === sec.id ? { ...x, visible: e.target.checked } : x)))} />
            {sectionNames[sec.id] ?? sec.id}
          </label>
          <span {...sort.handle(i)}>⠿</span>
          <button type="button" className={btn} disabled={i === 0} aria-label={`Đưa ${sectionNames[sec.id] ?? sec.id} lên`} onClick={() => set(applyOp(list, { type: "move", index: i, to: i - 1 }))}>↑</button>
          <button type="button" className={btn} disabled={i === list.length - 1} aria-label={`Đưa ${sectionNames[sec.id] ?? sec.id} xuống`} onClick={() => set(applyOp(list, { type: "move", index: i, to: i + 1 }))}>↓</button>
        </div>
      ))}
    </div>
  );
}

const rand = (n: number) => 1 + Math.floor(Math.random() * n);
const any = <T,>(list: readonly T[]) => list[rand(list.length) - 1];
function pick<T extends string>(label: string, value: T, list: readonly T[], names: Record<string, string>, onChange: (v: T) => void) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <select className={input} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {list.map((v) => <option key={v} value={v}>{names[v] ?? v}</option>)}
      </select>
    </label>
  );
}

// One card per screen, in film order. Untouched screens keep their default background.
export function Scenery({ site, update }: { site: Site; update: Update }) {
  const screens: [Look, string][] = [
    ...fixedScenes.slice(0, 4).map((l): [Look, string] => [l, sceneNames[l.id] ?? l.id]),
    ...site.content.vi.projects.items.map((p, i): [Look, string] => [projectLook(p.url, i), `Dự án: ${p.name || i + 1}`]),
    ...fixedScenes.slice(4).map((l): [Look, string] => [l, sceneNames[l.id] ?? l.id]),
  ];
  const ids = screens.map(([d]) => d.id);
  const set = (d: Look, patch: Partial<Look>) =>
    update((s) => {
      const next = { ...lookFor(s.settings.scenery, d.id, d), ...patch };
      // Drop entries of deleted projects while we are at it.
      return setIn(s, ["settings", "scenery"], [...s.settings.scenery.filter((x) => x.id !== d.id && ids.includes(x.id)), next]);
    });
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">Mỗi màn chọn cảnh, giờ, bảng màu và gió. &quot;Đổi biến thể&quot; giữ loại cảnh nhưng vẽ lại núi, cây, cỏ khác đi; &quot;Ngẫu nhiên&quot; đổi cả cảnh, màu và gió. Tắt bớt lớp để màn gọn hơn. Bật Xem trước để thấy ngay.</p>
      {screens.map(([d, name]) => {
        const l = lookFor(site.settings.scenery, d.id, d);
        return (
          <fieldset key={d.id} className={card}>
            <legend className="sr-only">{name}</legend>
            <p className="font-medium">{name}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pick("Cảnh", l.set, sceneSets, setNames, (v) => set(d, { set: v }))}
              {pick("Giờ", l.time, sceneTimes, timeNames, (v) => set(d, { time: v }))}
              {pick("Bảng màu", l.palette, scenePalettes, paletteNames, (v) => set(d, { palette: v }))}
              {pick("Gió", l.wind, sceneWinds, windNames, (v) => set(d, { wind: v }))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-auto text-muted">Biến thể #{l.seed}</span>
              <button type="button" className={`${btn} py-2`} onClick={() => set(d, { seed: rand(999) })}>Đổi biến thể ↻</button>
              <button type="button" className={`${btn} py-2`} onClick={() => set(d, { set: any(sceneSets), palette: any(scenePalettes), wind: any(sceneWinds), seed: rand(999) })}>Ngẫu nhiên 🎲</button>
              <button type="button" className={`${btn} py-2`} onClick={() => set(d, d)}>Về mặc định</button>
            </div>
            {layerGroups.map(([group, names]) => (
              <div key={group} className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="w-20 text-xs font-semibold tracking-wide text-muted uppercase">{group}</span>
                {Object.entries(names).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-5 accent-accent" checked={l[k as keyof typeof names]} onChange={(e) => set(d, { [k]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
            ))}
          </fieldset>
        );
      })}
    </div>
  );
}

const modes = ["light", "dark"] as const;

// Defaults live in app/globals.css; an empty box means "use that".
export function Theme({ site, update }: { site: Site; update: Update }) {
  const set = (mode: (typeof modes)[number], token: string, value: string) =>
    update((s) => {
      const rest = { ...s.settings.theme[mode] };
      delete rest[token];
      return setIn(s, ["settings", "theme", mode], value.trim() ? { ...rest, [token]: value } : rest);
    });
  return (
    <div className={card}>
      <p className="text-sm text-muted">Ô trống = dùng màu mặc định của nền sáng / nền tối. Nhận #hex, rgb(...), hsl(...). Màu phong cảnh không chỉnh ở đây.</p>
      <div className="hidden grid-cols-[10rem_1fr_1fr] gap-2 sm:grid">
        <span />
        <span className="text-sm font-medium">Nền sáng</span>
        <span className="text-sm font-medium">Nền tối</span>
      </div>
      {themeTokens.map((t) => (
        // Phones: name on its own line, the two boxes below it.
        <div key={t} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[10rem_1fr_1fr]">
          <span className="col-span-2 text-sm sm:col-span-1">{tokenNames[t] ?? t}</span>
          {modes.map((m) => {
            const v = site.settings.theme[m][t] ?? "";
            const mode = m === "light" ? "nền sáng" : "nền tối";
            return (
              <div key={m} className="flex min-w-0 items-center gap-2">
                <span className="size-8 shrink-0 rounded border border-line" style={v ? { background: v } : undefined} aria-hidden />
                <input aria-label={`${tokenNames[t] ?? t} (${mode})`} className={`${input} min-w-0`} placeholder={m === "light" ? "Sáng" : "Tối"} value={v} onChange={(e) => set(m, t, e.target.value)} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Always cv.pdf; the ?v= stamp makes browsers and the CDN fetch the new file.
export function CvUpload({ supabase, update }: { supabase: SupabaseClient; update: Update }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setBusy(true);
    setErr("");
    const bucket = supabase.storage.from("portfolio");
    const { error } = await bucket.upload("cv.pdf", file, { upsert: true, contentType: "application/pdf" });
    setBusy(false);
    if (error) return setErr(error.message);
    update((s) => setIn(s, ["profile", "cv"], `${bucket.getPublicUrl("cv.pdf").data.publicUrl}?v=${Date.now()}`));
  }
  return (
    <div className={card}>
      <label className="grid gap-1">
        <span className="text-sm font-medium">Tải CV lên (PDF)</span>
        <input type="file" accept="application/pdf" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      <p className="text-sm text-muted">{busy ? "Đang tải lên…" : "File lên ngay; ô Link CV tự đổi theo. Bấm Lưu & xuất bản để trang dùng link mới."}</p>
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
    </div>
  );
}
