import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  async redirects() {
    return [
      { source: "/dashboard/:path*", destination: "/", permanent: false },
      { source: "/:userId/success", destination: "/", permanent: false },
      { source: "/:userId/cancel", destination: "/", permanent: false },
      { source: "/payments/:path*", destination: "/", permanent: false },
      { source: "/start", destination: "/", permanent: false },
    ]
  },
}

export default nextConfig
