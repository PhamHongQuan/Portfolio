import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";

// One page: shared scene links (`/?s=work-2`) are canonical to `/`, so they stay out. No lastmod:
// Google ignores it unless it is accurate, and a request-time date never is.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { profile } = await getSite();
  return [{ url: profile.site }];
}
