import { content } from "./content";

// What a shared link to each scene (`/?s=work-2`) shows in its preview: [heading, accent line, small line].
// Ids match the scenes' ids in the components. English, like the default page.
const c = content.en;

export const siteTitle = "Phạm Hồng Quân, Frontend Developer";
export const siteDescription =
  "Frontend developer building fast, responsive interfaces with React, Next.js and Tailwind CSS, with enough backend to wire them to real APIs.";

export const shareScenes: Record<string, [string, string, string]> = {
  about: [c.about.title, c.hero.role, c.footer.tagline],
  principles: [c.about.principlesTitle, c.about.principles.map((p) => p.title).join(" · "), ""],
  stack: [c.stack.title, c.stack.layers.map((l) => l.name).join(" · "), c.stack.intro],
  ...Object.fromEntries(
    c.projects.items.map((p, i) => [i === 0 ? "work" : `work-${i + 1}`, [p.name, `${p.kind}, ${p.year}`, p.stack.join(" · ")]]),
  ),
  experience: [c.experience.title, c.experience.jobs.map((j) => `${j.role}, ${j.org}`).join(" · "), c.experience.intro],
  education: [c.experience.educationTitle, c.experience.education.map((e) => e.title).join(" · "), ""],
  contact: [c.contact.title, c.hero.status, c.contact.lead],
};
