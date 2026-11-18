import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// Social preview card in the hero's look: dark green night, mint light, sand-yellow accent line.
// `brand` (the name) goes in the corner when the heading is a scene title instead of the name.
export function ogCard(heading: string, accent: string, small: string, brand = "") {
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
        {brand && (
          <div style={{ position: "absolute", top: 72, left: 80, fontSize: 30, color: "#88a89b" }}>{brand}</div>
        )}
        <div style={{ fontSize: heading.length > 24 ? 84 : 112, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
          {heading}
        </div>
        <div style={{ marginTop: 28, fontSize: 40, color: "#f3d37a" }}>{accent}</div>
        {small && <div style={{ marginTop: 16, fontSize: 30, color: "#88a89b" }}>{small}</div>}
      </div>
    ),
    ogSize,
  );
}
