import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { fetchLegalSections } from "@/lib/legal-documents"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your information.`,
  alternates: {
    canonical: "/privacy",
  },
}

export default async function PrivacyPage() {
  const sections = await fetchLegalSections("privacy-policy")
  return (
    <LegalDocumentPage pageTitle="Privacy Policy" sections={sections} />
  )
}
