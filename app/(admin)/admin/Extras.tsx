"use client";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { themeTokens, type Site } from "@/lib/content";
import { applyOp, setIn } from "@/lib/admin";
import { btn, card, input, useSort, type Update } from "./Field";
import { sectionNames, tokenNames } from "./labels";

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
