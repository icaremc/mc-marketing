import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "ICare MC",
  description: "Parent and patient mobile web app.",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#4CAF8A",
}

/** Route groups supply tab vs stack shells. */
export default function PatientAppRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
