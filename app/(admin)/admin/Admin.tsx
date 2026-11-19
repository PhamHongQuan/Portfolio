"use client";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { content, profile, settings, type Site } from "@/lib/content";
import { fromRows, pairUp, type Row } from "@/lib/merge";
import { clean, validate } from "@/lib/admin";
import Field, { input, type Update } from "./Field";
import { CvUpload, Sections, Theme } from "./Extras";
import { publish } from "./actions";

const defaults: Site = { content, profile, settings };
const tabs = { content: "Nội dung", profile: "Hồ sơ", settings: "Cài đặt" } as const;
type Tab = keyof typeof tabs;
type Msg = { kind: "ok" | "err"; text: string[] };
const btn = "rounded-lg border border-line px-3 py-2 text-sm disabled:opacity-40";

export default function Admin({ url, anonKey }: { url: string; anonKey: string }) {
  const supabase = useMemo(() => createClient(url, anonKey), [url, anonKey]);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<Tab>("content");
  const [msg, setMsg] = useState<Msg | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // Load once. If the session drops and comes back, `site` (and the unsaved edits) stays.
  useEffect(() => {
    if (!session || site) return;
    supabase
      .from("site_content")
      .select("key,data")
      .then(({ data, error }) => {
        if (error) setMsg({ kind: "err", text: [`Không tải được dữ liệu: ${error.message}. Tải lại trang để thử lại.`] });
        else {
          // Both languages get the same items, even if an old row has more on one side.
          const s = fromRows(defaults, (data ?? []) as Row[]);
          const [en, vi] = pairUp(s.content.en, s.content.vi);
          setSite({ ...s, content: { en, vi } as Site["content"] });
        }
      });
  }, [session, site, supabase]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Errors and results show above the form; the save button is sticky, so bring them into view.
  useEffect(() => {
    if (msg) scrollTo({ top: 0, behavior: "smooth" });
  }, [msg]);

  const update: Update = (f) => {
    setSite((s) => (s ? f(s) : s));
    setDirty(true);
  };

  async function save() {
    if (!site) return;
    const data = clean(site);
    const errs = validate(data);
    if (errs.length) return setMsg({ kind: "err", text: errs });
    setSaving(true);
    setMsg(null);
    let saved = false;
    try {
      const rows = [
        { key: "en", data: data.content.en },
        { key: "vi", data: data.content.vi },
        { key: "profile", data: data.profile },
        { key: "settings", data: data.settings },
      ];
      const { error } = await supabase.from("site_content").upsert(rows);
      if (error) return setMsg({ kind: "err", text: [`Lưu thất bại: ${error.message}`] });
      saved = true;
      setSite(data); // the form is disabled while saving, so nothing typed since the click is lost
      setDirty(false);
      const token = (await supabase.auth.getSession()).data.session?.access_token ?? "";
      const res = await publish(token);
      setMsg(
        res.ok
          ? { kind: "ok", text: [`Đã lưu và xuất bản lúc ${new Date().toLocaleTimeString("vi")}.`] }
          : { kind: "err", text: [`Đã lưu nhưng chưa xuất bản (${res.error}). Bấm Lưu & xuất bản lần nữa.`] },
      );
    } catch (e) {
      const why = e instanceof Error ? e.message : String(e);
      setMsg({ kind: "err", text: [saved ? `Đã lưu nhưng chưa xuất bản (${why}). Bấm Lưu & xuất bản lần nữa.` : `Lưu thất bại: ${why}`] });
    } finally {
      setSaving(false);
    }
  }

  function restore() {
    if (!confirm(`Đặt tab "${tabs[tab]}" về mặc định? Chỉ ghi khi bấm Lưu & xuất bản.`)) return;
    update((s) => (tab === "content" ? { ...s, content: defaults.content } : tab === "profile" ? { ...s, profile: defaults.profile } : { ...s, settings: defaults.settings }));
  }

  async function signOut() {
    if (dirty && !confirm("Có thay đổi chưa lưu. Vẫn đăng xuất?")) return;
    await supabase.auth.signOut();
    setSite(null);
    setDirty(false);
  }

  if (!ready) return <main className="p-6 text-muted">Đang tải…</main>;
  if (!session) return <Login supabase={supabase} />;

  return (
    <main className="mx-auto grid max-w-5xl gap-4 p-4 md:p-6">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-line bg-bg py-3">
        <div role="tablist" className="flex gap-1">
          {(Object.keys(tabs) as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={`${btn} ${tab === t ? "bg-surface font-semibold" : ""}`} onClick={() => setTab(t)}>
              {tabs[t]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted">{dirty ? "Chưa lưu" : ""}</span>
        <button className={btn} onClick={restore} disabled={!site || saving}>Khôi phục mặc định</button>
        <button className={`${btn} border-accent bg-accent font-semibold text-on-accent`} onClick={save} disabled={!site || saving}>
          {saving ? "Đang lưu…" : "Lưu & xuất bản"}
        </button>
        <button className={btn} onClick={signOut}>Đăng xuất</button>
      </header>

      {msg && (
        <div role={msg.kind === "err" ? "alert" : "status"} className={`rounded-xl border p-3 text-sm ${msg.kind === "err" ? "border-red-400 text-red-300" : "border-accent text-accent"}`}>
          <ul className="grid gap-1">{msg.text.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      )}

      <fieldset disabled={saving} className="grid min-w-0 gap-4">
        {!site ? (
          <p className="text-muted">Đang tải dữ liệu…</p>
        ) : tab === "content" ? (
          <Field def={defaults.content.en} site={site} roots={[["content", "en"], ["content", "vi"]]} path={[]} label="" update={update} />
        ) : tab === "profile" ? (
          <>
            <Field def={defaults.profile} site={site} roots={[["profile"]]} path={[]} label="" update={update} />
            <CvUpload supabase={supabase} update={update} />
          </>
        ) : (
          <>
            <Sections site={site} update={update} />
            <Theme site={site} update={update} />
            <Field def={defaults.settings.seo} site={site} roots={[["settings", "seo"]]} path={[]} label="seo" update={update} />
          </>
        )}
      </fieldset>
    </main>
  );
}

function Login({ supabase }: { supabase: SupabaseClient }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) setErr(error.message);
  }
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <form onSubmit={submit} className="grid w-full max-w-sm gap-3 rounded-2xl border border-line bg-surface p-6">
        <h1 className="text-xl font-semibold">Admin</h1>
        <label className="grid gap-1 text-sm">Email<input name="email" type="email" required autoComplete="username" className={input} /></label>
        <label className="grid gap-1 text-sm">Mật khẩu<input name="password" type="password" required autoComplete="current-password" className={input} /></label>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
        <button disabled={busy} className="rounded-lg bg-accent px-3 py-2 font-semibold text-on-accent disabled:opacity-40">{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
      </form>
    </main>
  );
}
