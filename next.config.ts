import type { NextConfig } from "next";
import { shareScenes } from "./lib/share";

const nextConfig: NextConfig = {
  // A shared scene link (`/?s=work-2`) is served from its own prerendered page, which carries that
  // scene's preview image; the address stays as shared. Unknown values just get the home page.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "query", key: "s", value: `(?<scene>${Object.keys(shareScenes).join("|")})` }],
          destination: "/s/:scene",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
