import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/brand"

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #E8F7F0 0%, #F8FBFA 50%, #D6EBFA 100%)",
          color: "#1E2D32",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 24,
              background: "#4CAF8A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            IC
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 56, fontWeight: 700 }}>{siteConfig.name}</span>
            <span style={{ fontSize: 28, color: "#5A6B73" }}>{siteConfig.tagline}</span>
          </div>
        </div>
        <p style={{ fontSize: 32, lineHeight: 1.4, maxWidth: 900, color: "#5A6B73" }}>
          {siteConfig.description}
        </p>
      </div>
    ),
    { ...size }
  )
}
