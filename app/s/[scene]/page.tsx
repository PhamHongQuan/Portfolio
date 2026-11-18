import type { Metadata } from "next";
import Home from "../../page";
import { shareScenes } from "@/lib/share";
import { getSite } from "@/lib/site";

// The page behind a shared scene link: `/?s=work-2` is rewritten here (next.config.ts), so the link
// gets that scene's title and preview image while the page itself is the same, prerendered.
// Scenes added later in the admin (a new project) render on first visit, then stay cached.
export const generateStaticParams = async () => Object.keys(shareScenes((await getSite()).content.en)).map((scene) => ({ scene }));

export async function generateMetadata({ params }: { params: Promise<{ scene: string }> }): Promise<Metadata> {
  const { scene } = await params;
  const { content, settings } = await getSite();
  const card = shareScenes(content.en)[scene];
  if (!card) return {}; // e.g. work-9 after a project was removed: plain home page
  const title = `${card[0]} · ${content.en.name}`;
  const description = settings.seo.description;
  return {
    title,
    alternates: { canonical: "/" },
    openGraph: { title, description, type: "profile", url: `/?s=${scene}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default Home;
