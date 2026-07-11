import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { fetchLegalSections } from "@/lib/legal-documents"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Medical disclaimer",
  description: `${siteConfig.name} is an educational and care-coordination tool, not a substitute for medical advice.`,
  alternates: {
    canonical: "/medical-disclaimer",
  },
}

export default async function MedicalDisclaimerPage() {
  const sections = await fetchLegalSections("medical-disclaimer")
  return (
    <LegalDocumentPage pageTitle="Medical disclaimer" sections={sections} />
  )
}
