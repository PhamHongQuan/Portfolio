import type { Metadata } from "next";
import Home from "../../page";
import { shareScenes, siteDescription } from "@/lib/share";

// The page behind a shared scene link: `/?s=work-2` is rewritten here (next.config.ts), so the link
// gets that scene's title and preview image while the page itself is the same, prerendered.
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(shareScenes).map((scene) => ({ scene }));

export async function generateMetadata({ params }: { params: Promise<{ scene: string }> }): Promise<Metadata> {
  const { scene } = await params;
  const title = `${shareScenes[scene][0]} · Phạm Hồng Quân`;
  return {
    title,
    alternates: { canonical: "/" },
    openGraph: { title, description: siteDescription, type: "profile", url: `/?s=${scene}` },
    twitter: { card: "summary_large_image", title, description: siteDescription },
  };
}

export default Home;
