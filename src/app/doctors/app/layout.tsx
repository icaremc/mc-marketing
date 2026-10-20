import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "ICare Doctors",
  description: "Doctor practice mobile web app.",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#4CAF8A",
}

export default function DoctorAppRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
