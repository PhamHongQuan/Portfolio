"use client";
import { Fragment, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { themeTokens, type Site } from "@/lib/content";
import { applyOp, setIn } from "@/lib/admin";
import { input, type Update } from "./Field";

const btn = "rounded-md border border-line px-2 py-1 text-sm disabled:opacity-40";
const box = "grid gap-3 rounded-xl border border-line p-4";

// Order and visibility only: ids are fixed in code.
export function Sections({ site, update }: { site: Site; update: Update }) {
  const list = site.settings.sections;
  const set = (next: unknown[]) => update((s) => setIn(s, ["settings", "sections"], next));
  return (
    <fieldset className={box}>
      <legend className="px-1 font-semibold">sections</legend>
      <p className="text-sm text-muted">Hero luôn đứng đầu. Ẩn about là ẩn luôn principles; ẩn experience là ẩn luôn education. Thứ tự mặc định khớp hành trình đêm → bình minh.</p>
      {list.map((sec, i) => (
        <div key={sec.id} className="flex items-center gap-2">
          <label className="mr-auto flex items-center gap-2">
            <input type="checkbox" className="size-5 accent-accent" checked={sec.visible} onChange={(e) => set(list.map((x) => (x.id === sec.id ? { ...x, visible: e.target.checked } : x)))} />
            {sec.id}
          </label>
          <button type="button" className={btn} disabled={i === 0} aria-label={`Đưa ${sec.id} lên`} onClick={() => set(applyOp(list, { type: "move", index: i, to: i - 1 }))}>↑</button>
          <button type="button" className={btn} disabled={i === list.length - 1} aria-label={`Đưa ${sec.id} xuống`} onClick={() => set(applyOp(list, { type: "move", index: i, to: i + 1 }))}>↓</button>
        </div>
      ))}
    </fieldset>
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
    <fieldset className={box}>
      <legend className="px-1 font-semibold">theme</legend>
      <p className="text-sm text-muted">Để trống = màu mặc định. Nhận #hex, rgb(...), hsl(...).</p>
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
        <span />
        <span className="text-sm text-muted">light</span>
        <span className="text-sm text-muted">dark</span>
        {themeTokens.map((t) => (
          <Fragment key={t}>
            <span className="text-sm">{t}</span>
            {modes.map((m) => {
              const v = site.settings.theme[m][t] ?? "";
              return (
                <div key={m} className="flex items-center gap-2">
                  <span className="size-8 shrink-0 rounded border border-line" style={v ? { background: v } : undefined} aria-hidden />
                  <input aria-label={`${t} (${m})`} className={input} placeholder="mặc định" value={v} onChange={(e) => set(m, t, e.target.value)} />
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </fieldset>
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
    <div className={box}>
      <label className="grid gap-1">
        <span className="font-semibold">Upload CV (PDF)</span>
        <input type="file" accept="application/pdf" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      <p className="text-sm text-muted">{busy ? "Đang tải lên…" : "File lên ngay; link ở ô cv đổi theo, bấm Lưu & xuất bản để trang dùng link mới."}</p>
      {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
    </div>
  );
}
