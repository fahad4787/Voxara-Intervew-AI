import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BARS = [
  { h: 48, accent: false },
  { h: 88, accent: true },
  { h: 60, accent: false },
  { h: 110, accent: true },
  { h: 54, accent: false },
] as const;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12161f",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 10,
            width: 96,
            height: 96,
          }}
        >
          {BARS.map((bar, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: bar.h,
                borderRadius: 999,
                background: bar.accent ? "#2dd4bf" : "rgba(240,243,247,0.62)",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
