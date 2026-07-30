import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const BARS = [
  { h: 18, accent: false },
  { h: 32, accent: true },
  { h: 22, accent: false },
  { h: 40, accent: true },
  { h: 20, accent: false },
] as const;

export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 4,
            width: 34,
            height: 34,
          }}
        >
          {BARS.map((bar, i) => (
            <div
              key={i}
              style={{
                width: 5,
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
