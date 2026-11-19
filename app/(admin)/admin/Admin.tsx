"use client";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { content, profile, settings, type Site } from "@/lib/content";
import { fromRows, pairUp, type Row } from "@/lib/merge";
import { clean, getIn, setIn, validate } from "@/lib/admin";
import Field, { input, type Update } from "./Field";
import { leftovers, sections, type Section } from "./labels";
import { CvUpload, Sections, Theme } from "./Extras";
import { publish } from "./actions";

const defaults: Site = { content, profile, settings };
const extra = leftovers(defaults.content.en);
const menu = sections.filter((s) => s.kind !== "other" || extra.length);
const groups = [...new Set(menu.map((s) => s.group))];
const langs = ["en", "vi"] as const;
type Msg = { kind: "ok" | "err"; text: string[] };
const btn = "rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-accent disabled:opacity-40";
const primary = "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:opacity-90 disabled:opacity-40";

// A field with no inner structure (text, number, list of lines).
const isPlain = (def: unknown) => typeof def !== "object" || (Array.isArray(def) && typeof def[0] !== "object");

// Paths a content section edits; "Khác" edits whatever no section claims.
const pathsOf = (sec: Section) => (sec.kind === "other" ? extra : (sec.paths ?? []));

export default function Admin({ url, anonKey }: { url: string; anonKey: string }) {
  const supabase = useMemo(() => createClient(url, anonKey), [url, anonKey]);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [dirty, setDirty] = useState(false);
  const [secId, setSecId] = useState(menu[0].id);
  const sec = menu.find((s) => s.id === secId) ?? menu[0];
  const [msg, setMsg] = useState<Msg | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const previews = useRef(new Set<Window>());
  const latest = useRef<Site | null>(null);

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

  // Live preview: the site (in the side frame or a tab opened from here) says "preview-ready" when it
  // loads or navigates; it then gets the current draft, and every edit after that.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.type !== "preview-ready" || !e.source) return;
      const w = e.source as Window;
      previews.current.add(w);
      if (latest.current) w.postMessage({ type: "preview", site: clean(latest.current) }, location.origin);
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    latest.current = site;
    if (!site) return;
    const draft = clean(site);
    for (const w of previews.current) {
      if (w.closed) previews.current.delete(w);
      else w.postMessage({ type: "preview", site: draft }, location.origin);
    }
  }, [site]);

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
    if (!confirm(`Đặt mục "${sec.title}" về mặc định? Chỉ ghi khi bấm Lưu & xuất bản.`)) return;
    update((s) => {
      if (sec.kind === "profile") return { ...s, profile: defaults.profile };
      if (sec.kind === "order") return setIn(s, ["settings", "sections"], defaults.settings.sections);
      if (sec.kind === "theme") return setIn(s, ["settings", "theme"], defaults.settings.theme);
      if (sec.kind === "seo") return setIn(s, ["settings", "seo"], defaults.settings.seo);
      return pathsOf(sec).reduce(
        (acc, p) => langs.reduce((x, l) => setIn(x, ["content", l, ...p.split(".")], getIn(defaults.content[l], p.split("."))), acc),
        s,
      );
    });
  }

  async function signOut() {
    if (dirty && !confirm("Có thay đổi chưa lưu. Vẫn đăng xuất?")) return;
    await supabase.auth.signOut();
    setSite(null);
    setDirty(false);
  }

  if (!ready) return <main className="p-6 text-muted">Đang tải…</main>;
  if (!session) return <Login supabase={supabase} />;

  const body = !site ? (
    <p className="text-muted">Đang tải dữ liệu…</p>
  ) : sec.kind === "profile" ? (
    <>
      <div className="grid gap-4 rounded-xl border border-line bg-surface p-4">
        <Field def={defaults.profile} site={site} roots={[["profile"]]} path={[]} ns="profile" update={update} />
      </div>
      <CvUpload supabase={supabase} update={update} />
    </>
  ) : sec.kind === "order" ? (
    <Sections site={site} update={update} />
  ) : sec.kind === "theme" ? (
    <Theme site={site} update={update} />
  ) : sec.kind === "seo" ? (
    <div className="grid gap-4 rounded-xl border border-line bg-surface p-4">
      <Field def={defaults.settings.seo} site={site} roots={[["settings", "seo"]]} path={[]} ns="seo" update={update} />
    </div>
  ) : (
    // Consecutive single fields share one card; lists and groups bring their own frame.
    pathsOf(sec)
      .reduce<string[][]>((runs, p) => {
        const plain = isPlain(getIn(defaults.content.en, p.split(".")));
        const last = runs.at(-1);
        if (plain && last && isPlain(getIn(defaults.content.en, last[0].split(".")))) last.push(p);
        else runs.push([p]);
        return runs;
      }, [])
      .map((run) => {
        const fields = run.map((p) => {
          const path = p.split(".");
          return <Field key={p} def={getIn(defaults.content.en, path)} site={site} roots={[["content", "en"], ["content", "vi"]]} path={path} update={update} />;
        });
        return isPlain(getIn(defaults.content.en, run[0].split("."))) ? (
          <div key={run[0]} className="grid gap-5 rounded-xl border border-line bg-surface p-4">{fields}</div>
        ) : (
          <div key={run[0]}>{fields}</div>
        );
      })
  );

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className={`mx-auto flex flex-wrap items-center gap-2 px-4 py-3 ${preview ? "" : "max-w-6xl"}`}>
          <span className="font-semibold">Admin</span>
          {dirty && <span className="rounded-full bg-sun/30 px-2 py-0.5 text-xs text-sun-ink">Chưa lưu</span>}
          <span className="ml-auto" />
          <button className={`${btn} hidden lg:inline-block`} aria-pressed={preview} onClick={() => setPreview((p) => !p)}>
            {preview ? "Ẩn xem trước" : "Xem trước"}
          </button>
          <button className={`${btn} lg:hidden`} onClick={() => open("/", "portfolio-preview")}>Xem trước ↗</button>
          <button className={primary} onClick={save} disabled={!site || saving}>
            {saving ? "Đang lưu…" : "Lưu & xuất bản"}
          </button>
          <button className={btn} onClick={signOut}>Đăng xuất</button>
        </div>
      </header>

      <div className={`mx-auto flex gap-6 px-4 py-6 ${preview ? "" : "max-w-6xl"}`}>
        <nav aria-label="Mục cần sửa" className={`sticky top-20 hidden w-52 shrink-0 self-start ${preview ? "xl:block" : "md:block"}`}>
          {groups.map((g) => (
            <div key={g} className="mb-4">
              <p className="mb-1 px-3 text-xs font-semibold tracking-wide text-muted uppercase">{g}</p>
              {menu.filter((m) => m.group === g).map((m) => (
                <button
                  key={m.id}
                  aria-current={m.id === sec.id ? "page" : undefined}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm ${m.id === sec.id ? "bg-accent/10 font-semibold text-accent" : "hover:bg-surface"}`}
                  onClick={() => setSecId(m.id)}
                >
                  {m.title}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="grid min-w-0 flex-1 content-start gap-4">
          <select aria-label="Chọn mục cần sửa" className={`${input} ${preview ? "xl:hidden" : "md:hidden"}`} value={sec.id} onChange={(e) => setSecId(e.target.value)}>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {menu.filter((m) => m.group === g).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </optgroup>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="mr-auto text-2xl font-semibold">{sec.title}</h1>
            <button className={btn} onClick={restore} disabled={!site || saving}>Khôi phục mặc định mục này</button>
          </div>

          {msg && (
            <div role={msg.kind === "err" ? "alert" : "status"} className={`rounded-xl border p-3 text-sm ${msg.kind === "err" ? "border-red-300 bg-red-50 text-red-800" : "border-accent/40 bg-accent/10 text-accent"}`}>
              {msg.kind === "err" && msg.text.length > 1 && <p className="mb-1 font-semibold">Chưa lưu được, cần sửa:</p>}
              <ul className="grid gap-1">{msg.text.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}

          <fieldset disabled={saving} className="grid min-w-0 gap-4">
            {body}
          </fieldset>
        </main>

        {preview && (
          <aside className="sticky top-20 hidden h-[calc(100dvh-6.5rem)] w-[45%] shrink-0 flex-col overflow-hidden rounded-xl border border-line bg-surface lg:flex">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-sm">
              <span className="font-medium">Xem trước</span>
              <span className="text-muted">· cập nhật khi bạn gõ, chưa xuất bản</span>
              <button className="ml-auto text-accent hover:underline" onClick={() => open("/", "portfolio-preview")}>Mở tab riêng ↗</button>
            </div>
            <iframe src="/" title="Xem trước trang portfolio" className="min-h-0 flex-1" />
          </aside>
        )}
      </div>
    </div>
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
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="rounded-lg bg-accent px-3 py-2 font-semibold text-on-accent disabled:opacity-40">{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
      </form>
    </main>
  );
}
