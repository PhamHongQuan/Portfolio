import type { NextConfig } from "next";
import { scenePattern } from "./lib/share";

const supabase = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL) : null;

const nextConfig: NextConfig = {
  // Images uploaded in the admin live in Supabase Storage (bucket "portfolio").
  images: {
    remotePatterns: supabase ? [{ protocol: "https", hostname: supabase.hostname, pathname: "/storage/v1/object/public/**" }] : [],
  },
  // A shared scene link (`/?s=work-2`) is served from its own prerendered page, which carries that
  // scene's preview image; the address stays as shared. Unknown values just get the home page.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "query", key: "s", value: `(?<scene>${scenePattern})` }],
          destination: "/s/:scene",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
