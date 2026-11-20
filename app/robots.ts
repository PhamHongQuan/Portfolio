import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";

// Everyone, AI crawlers included, may read the site; only the admin and API are off limits.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { profile } = await getSite();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${profile.site}/sitemap.xml`,
  };
}
