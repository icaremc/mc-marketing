import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { fetchLegalSections } from "@/lib/legal-documents"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "About us",
  description: `Learn about ${siteConfig.name}: mission, vision, and who we serve.`,
  alternates: {
    canonical: "/about",
  },
}

export default async function AboutPage() {
  const sections = await fetchLegalSections("about-app")
  return <LegalDocumentPage pageTitle="About us" sections={sections} />
}
