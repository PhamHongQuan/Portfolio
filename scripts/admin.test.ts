// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { content, profile, settings } from "../lib/content.ts";
import { fromRows } from "../lib/merge.ts";

const def = { content, profile, settings };

test("fromRows: no rows gives the defaults", () => {
  assert.deepEqual(fromRows(def, []), def);
});

test("fromRows: wrong types fall back, sections deduped and completed", () => {
  const s = fromRows(def, [
    { key: "profile", data: { email: 5, phone: "1" } },
    { key: "settings", data: { sections: [{ id: "contact", visible: false }, { id: "x", visible: true }, { id: "contact", visible: true }] } },
  ]);
  assert.equal(s.profile.email, profile.email);
  assert.equal(s.profile.phone, "1");
  assert.deepEqual(s.settings.sections.map((x) => x.id), ["contact", "about", "stack", "projects", "experience"]);
  assert.equal(s.settings.sections[0].visible, false);
  assert.deepEqual(settings.sections.map((x) => x.id), ["about", "stack", "projects", "experience", "contact"], "defaults not mutated");
});

import { applyOp, clean, getIn, setAll, setIn, validate } from "../lib/admin.ts";

const clone = () => structuredClone(def);
const both = [["content", "en"], ["content", "vi"]];

test("setIn is immutable", () => {
  const s = clone();
  const t = setIn(s, ["profile", "phone"], "9");
  assert.equal(t.profile.phone, "9");
  assert.equal(s.profile.phone, profile.phone);
  assert.equal(t.content, s.content);
});

test("paired array ops keep EN and VI the same length", () => {
  let s = clone();
  const p = ["projects", "items"];
  const n = content.en.projects.items.length;
  s = setAll(s, both, p, (v) => applyOp(v as unknown[], { type: "add", item: { name: "" } }));
  assert.equal(s.content.en.projects.items.length, n + 1);
  assert.equal(s.content.vi.projects.items.length, n + 1);
  s = setAll(s, both, p, (v) => applyOp(v as unknown[], { type: "move", index: 0, to: 1 }));
  assert.equal(s.content.en.projects.items[1].name, content.en.projects.items[0].name);
  assert.equal(s.content.vi.projects.items[1].name, content.vi.projects.items[0].name);
  s = setAll(s, both, p, (v) => applyOp(v as unknown[], { type: "remove", index: n }));
  assert.equal(s.content.en.projects.items.length, n);
  assert.equal(s.content.vi.projects.items.length, n);
  assert.deepEqual(applyOp([1, 2], { type: "move", index: 0, to: -1 }), [1, 2], "move out of range is a no-op");
  assert.equal(getIn(s, ["content", "en", "projects", "items", 99, "name"]), undefined);
});

test("clean drops empty lines from string arrays", () => {
  const s = setIn(clone(), ["content", "en", "hero", "stack"], ["React", "", "Next.js", ""]);
  assert.deepEqual(clean(s).content.en.hero.stack, ["React", "Next.js"]);
});

test("validate: defaults are valid", () => {
  assert.deepEqual(validate(clone()), []);
});

test("validate: catches every rule", () => {
  let s = clone();
  s = setIn(s, ["profile", "site"], "not a url");
  s = setIn(s, ["content", "en", "projects", "items", 1, "url"], s.content.en.projects.items[0].url); // duplicate
  s = setIn(s, ["content", "vi", "projects", "items", 0, "url"], ""); // empty, and differs from en
  s = setIn(s, ["content", "en", "about", "stats", 0, "value"], NaN);
  s = setIn(s, ["settings", "theme", "light"], { accent: "red;}" });
  s = setIn(s, ["content", "vi", "about", "principles"], s.content.vi.about.principles.slice(1)); // length mismatch
  const errs = validate(s).join("\n");
  for (const want of ["site", "trùng", "thiếu url", "EN và VI", "phải là số", "accent", "about.principles"]) {
    assert.ok(errs.includes(want), `missing error about "${want}" in:\n${errs}`);
  }
});

import { pairUp } from "../lib/merge.ts";

test("pairUp pads the shorter language with full blank items, nested too", () => {
  const en = structuredClone(content.en);
  const vi = structuredClone(content.vi);
  vi.projects.items.push(structuredClone(vi.projects.items[0]));
  en.experience.jobs[0].points = ["a"]; // string arrays are not paired
  const [a, b] = pairUp(en, vi) as [typeof en, typeof vi];
  assert.equal(a.projects.items.length, b.projects.items.length);
  const added = a.projects.items.at(-1)!;
  assert.equal(added.url, "");
  assert.deepEqual(added.study.did, []);
  assert.equal(typeof added.study.role, "string");
  assert.deepEqual(a.experience.jobs[0].points, ["a"]);
  assert.notDeepEqual(b.experience.jobs[0].points, ["a"]);
});

test("validate survives a partial project item", () => {
  const s = setIn(clone(), ["content", "vi", "projects", "items", 0], { name: "X" });
  assert.doesNotThrow(() => validate(s));
});

import { leftovers, sections } from "../app/(admin)/admin/labels.ts";

test("every content field belongs to a menu section; new fields land in Khác", () => {
  assert.deepEqual(leftovers(content.en), []);
  assert.deepEqual(leftovers({ ...content.en, brandNew: "x", hero: { ...content.en.hero, extra: [] } }), ["hero.extra", "brandNew"]);
  const paths = sections.flatMap((s) => s.paths ?? []);
  assert.equal(new Set(paths).size, paths.length, "no path in two sections");
});
