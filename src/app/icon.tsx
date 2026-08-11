import { ImageResponse } from "next/og"

export const size = { width: 192, height: 192 }
export const contentType = "image/png"

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
          background: "#0c0a09",
          borderRadius: 42,
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 36,
            background: "#1c1917",
            border: "3px solid #44403c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f59e0b",
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          HM
        </div>
      </div>
    ),
    size
  )
}
