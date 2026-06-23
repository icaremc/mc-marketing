import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/brand"

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const logoPath = join(process.cwd(), "public", "logo-icon.png")
  const logoBuffer = await readFile(logoPath)
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`

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
          background: "linear-gradient(135deg, #4CAF8A 0%, #3D9A76 45%, #2F7D62 100%)",
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            marginBottom: 32,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={120}
            height={120}
            style={{ borderRadius: 28 }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 56, fontWeight: 700 }}>{siteConfig.name}</span>
            <span style={{ fontSize: 28, opacity: 0.92 }}>{siteConfig.tagline}</span>
          </div>
        </div>
        <p style={{ fontSize: 30, lineHeight: 1.45, maxWidth: 920, opacity: 0.95 }}>
          {siteConfig.description}
        </p>
      </div>
    ),
    { ...size }
  )
}
