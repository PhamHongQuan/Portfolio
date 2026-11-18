import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { profile } = await getSite();
  return [{ url: profile.site, lastModified: new Date() }];
}
