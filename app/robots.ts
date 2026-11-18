import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { profile } = await getSite();
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${profile.site}/sitemap.xml` };
}
