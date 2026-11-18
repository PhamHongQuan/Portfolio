import { ogCard, ogSize } from "@/lib/ogCard";
import { siteTitle } from "@/lib/share";

export const alt = siteTitle;
export const size = ogSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return ogCard("Phạm Hồng Quân", "Frontend developer", "React · Next.js · TypeScript · Tailwind CSS");
}
