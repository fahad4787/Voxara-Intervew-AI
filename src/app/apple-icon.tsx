import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
        <svg width="96" height="96" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="v" x1="7.5" y1="8" x2="24.5" y2="8">
              <stop offset="0%" stopColor="#dce3ec" />
              <stop offset="50%" stopColor="#f3f7fb" />
              <stop offset="100%" stopColor="#5eead4" />
            </linearGradient>
          </defs>
          <path
            d="M7.5 8C11.5 16.5 14.2 22.2 16 24.5C17.8 22.2 20.5 16.5 24.5 8"
            stroke="url(#v)"
            strokeWidth="3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
