import { ImageResponse } from "next/og";

export const alt = "Phạm Hồng Quân, Frontend Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview card in the hero's look: dark green night, mint light, sand-yellow role line.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          color: "#e7f4ee",
          background: "radial-gradient(circle at 80% 10%, #3ddc97 0%, #0b3a2a 40%, #04100c 75%)",
        }}
      >
        <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Phạm Hồng Quân</div>
        <div style={{ marginTop: 28, fontSize: 40, color: "#f3d37a" }}>Frontend developer</div>
        <div style={{ marginTop: 16, fontSize: 30, color: "#88a89b" }}>React · Next.js · TypeScript · Tailwind CSS</div>
      </div>
    ),
    size,
  );
}
