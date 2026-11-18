import { ogCard, ogSize } from "@/lib/ogCard";
import { shareScenes, siteTitle } from "@/lib/share";

export const alt = siteTitle;
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => Object.keys(shareScenes).map((scene) => ({ scene }));

export default async function OpengraphImage({ params }: { params: Promise<{ scene: string }> }) {
  const [heading, accent, small] = shareScenes[(await params).scene];
  return ogCard(heading, accent, small, true);
}
