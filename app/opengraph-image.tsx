import { ogCard, ogSize } from "@/lib/ogCard";
import { getSite } from "@/lib/site";

export const alt = "Social preview";
export const size = ogSize;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { content } = await getSite();
  const c = content.en;
  return ogCard(c.name, c.hero.role, c.hero.stack.slice(0, 4).join(" · "));
}
