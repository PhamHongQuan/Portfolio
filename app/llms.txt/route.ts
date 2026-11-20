import { getSite } from "@/lib/site";

// /llms.txt (llmstxt.org): the portfolio as plain Markdown for AI assistants and agents, built from the
// same content as the page, so it follows every admin publish (getSite is cached under the "content" tag).
export async function GET() {
  const { content, profile, settings } = await getSite();
  const c = content.en;
  const list = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

  const body = [
    `# ${c.name}`,
    `> ${settings.seo.description}`,
    `${c.hero.role}. ${c.hero.intro}`,
    `Site: ${profile.site} (English and Vietnamese, one page).`,
    `## About`,
    [c.about.lead, ...c.about.body].join("\n\n"),
    `## ${c.about.principlesTitle}`,
    list(c.about.principles.map((p) => `${p.title}: ${p.text}`)),
    `## Skills`,
    list([...c.stack.layers.map((l) => `${l.name} (${l.level}): ${l.text} Tools: ${l.tools.join(", ")}.`), `Also: ${c.hero.stack.join(", ")}.`]),
    `## Projects`,
    list(c.projects.items.map((p) => `[${p.name}](${p.url}): ${p.kind}, ${p.year}. ${p.description} Stack: ${p.stack.join(", ")}.`)),
    `## Experience`,
    c.experience.jobs
      .map((j) => [`### ${j.role}, ${j.org} (${j.period})`, j.meta, list(j.points), j.stack.length ? `Stack: ${j.stack.join(", ")}.` : ""].filter(Boolean).join("\n"))
      .join("\n\n"),
    `## Education`,
    list(c.experience.education.map((e) => `${e.title}, ${e.org} (${e.period}). ${e.note}`)),
    `## Contact`,
    list([
      `Email: ${profile.email}`,
      `Location: ${c.contact.location}`,
      `Status: ${c.hero.status}`,
      ...(profile.github ? [`GitHub: ${profile.github}`] : []),
      ...(profile.linkedin ? [`LinkedIn: ${profile.linkedin}`] : []),
    ]),
  ].join("\n\n");

  return new Response(body + "\n", { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
