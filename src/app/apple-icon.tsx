import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

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
          background: "#0c0a09",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0c0a09",
            fontSize: 56,
            fontWeight: 800,
          }}
        >
          HM
        </div>
      </div>
    ),
    size
  )
}
