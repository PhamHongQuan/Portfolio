import { ogCard, ogSize } from "@/lib/ogCard";
import { shareScenes } from "@/lib/share";
import { getSite } from "@/lib/site";

export const alt = "Social preview";
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = async () => Object.keys(shareScenes((await getSite()).content.en)).map((scene) => ({ scene }));

export default async function OpengraphImage({ params }: { params: Promise<{ scene: string }> }) {
  const c = (await getSite()).content.en;
  const card = shareScenes(c)[(await params).scene];
  return card ? ogCard(card[0], card[1], card[2], c.name) : ogCard(c.name, c.hero.role, c.hero.stack.slice(0, 4).join(" · "));
}
